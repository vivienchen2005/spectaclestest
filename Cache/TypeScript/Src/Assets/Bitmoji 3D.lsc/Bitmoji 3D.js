// Bitmoji 3D.js
// Event: On Awake
// Description: Bitmoji component allows you to download Bitmoji 3D avatar for specified user

// API usage

// add event callbacks: 
// script.onDownloaded.add(() => { ... })) - add callback for successful Bitmoji 3D download 

// script.onDownloadFailed.add((e) => {...})) - add a callback in case bitmoji download failed

// script.download - call to download avatar for user specified in component inputs

// script.downloadAvatar() - download avatar for a user specified in component inputs

// script.downloadAvatarForUser(snapchatUser) - download avatar for specific user

// script.getUser() - get current user

// script.getExtras () - get extras 

// script.setRenderOrder(v) - set render order or all render mesh visuals

// script.getRenderOrder() - get current render order

// script.setShadowsEnabled(v) - enable or disable casting shadow

// script.getShadowsEnabled - if shadows are enabled

// script.setRenderLayer(v) - set render layer

// script.getRenderLayer() - get current render layer

//@input int bitmojiType = 0 {"widget":"combobox", "values":[{"label":"None", "value": -1}, {"label":"Me", "value":0}, {"label":"My Friend", "value":1}, {"label":"My AI", "value":2} ], "label" : "Bitmoji Owner"}


//@input Component friendsComponent {"showIf" : "bitmojiType" , "showIfValue" : "1", "hint" : "Optional: \nInstall Friends Custom Component from Asset Library\nAdd it to Scene \nReference added component here"}
//@input int friendIndex = 0 {"label":"index" , "showIf" : "bitmojiType" , "showIfValue" : "1"}
//@ui {"widget":"separator"}

//@input bool mixamoAnimation {"label" : "Adapt to Mixamo","showIf" : "mode" , "showIfValue" : "default", "hint" : "Set Animation Player component to play bitmoji animations "}

//@ui {"widget":"separator"}
//@input bool autoDownload = true {"hint": "download using Bitmoji.download() api instead"}
//@ui {"widget":"separator"}
//@input bool castShadow = true {"hint": "add shadow plane and enable shadows on the light source"}
//@input int renderOrder = 0 
// hidden inputs

//@input Asset.RemoteMediaModule remoteMediaModule
//@input Asset.BitmojiModule bitmojiModule
//@input Asset.Material materialHolder
//@input bool printDebug = true


let thisObject = script.getSceneObject();
let avatar = null;

let bitmojiJoints = {};
let bitmojiMeshes = {};
let bitmojiGltfAsset = {};

let user = undefined;

let renderOrder = script.renderOrder;
let castShadow = script.castShadow;

const BitmojiOwnerType = {
    NONE: -1,
    ME: 0,
    FRIENDBYINDEX: 1,
    AI: 2
};

let isLoading = false

const mixamoBitmojiMap = {
    "ROOT": "Hips",
    "C_spine0001_bind_JNT": "Spine",
    "C_spine0003_bind_JNT": "Spine1",
    "C_neck0001_bind_JNT": "Neck",
    "C_head_bind_JNT": "Head",
    "R_clavicle_bind_JNT": "RightShoulder",
    "R_armUpper0001_bind_JNT": "RightArm",
    "R_armLower0001_bind_JNT": "RightForeArm",
    "R_hand0001_bind_JNT": "RightHand",
    "L_clavicle_bind_JNT": "LeftShoulder",
    "L_armUpper0001_bind_JNT": "LeftArm",
    "L_armLower0001_bind_JNT": "LeftForeArm",
    "L_hand0001_bind_JNT": "LeftHand",
    "L_legUpper0001_bind_JNT": "LeftUpLeg",
    "L_legLower0001_bind_JNT": "LeftLeg",
    "L_foot0001_bind_JNT": "LeftFoot",
    "L_foot0002_bind_JNT": "LeftToeBase",
    "R_legUpper0001_bind_JNT": "RightUpLeg",
    "R_legLower0001_bind_JNT": "RightLeg",
    "R_foot0001_bind_JNT": "RightFoot",
    "R_foot0002_bind_JNT": "RightToeBase",
};

let eventModule = require("Modules/EventModule");
script.onDownloaded = new eventModule.EventWrapper();
script.onDownloadFailed = new eventModule.EventWrapper();

/**
 * Initializes the script and starts the download process if script.autoDownload is enabled.
 */
function init() {
    if (script.autoDownload
        && script.bitmojiType != BitmojiOwnerType.NONE && !isLoading) {
        downloadAvatar();
    }
}
/**
 * get Bitmoji data based in input settings and downloads gltf asset
 */
async function downloadAvatar() {
    getSnapchatUser()
        .then(user => downloadAvatarForUser(user))
        .catch(e => onDownloadFailed(e));
}

/**
 * downloads avatar for specific user
 * @param {SnapchatUser} snapchatUser 
 */

async function downloadAvatarForUser(snapchatUser) {
    if (isLoading) {
        debugPrint("Warning", "Loading in process");
        return;
    }
    if (!isNull(avatar)) {
        debugPrint("Warning", "Bitmoji avatar exists, deleting existing one.");
        onDestroy();
    }
    isLoading = true;

    let options = null;
    if (snapchatUser != null) {
        user = snapchatUser;
        options = Bitmoji3DOptions.create();
        options.user = user;
    }

    getBitmojiResource(options)
        .then(bitmoji3DResource => downloadGLTFAsset(bitmoji3DResource))
        .then(gltfAsst => instantiateGLTFAssetAsync(gltfAsst))
        .then(sceneObject => onDownloadSucceeded(sceneObject))
        .catch(e => onDownloadFailed(e))
    return avatar
}

/**
 * Determines the user based on the selected Bitmoji type.
 * @returns {Promise<SnapchatUser>} Resolves with the user data.
 */
async function getSnapchatUser() {
    return new Promise(function (resolve, reject) {
        switch (script.bitmojiType) {
            case 0:
                resolve(null)
                break;
            case 1:
                //get list of friends from the Friends component
                if (script.friendsComponent != undefined && script.friendsComponent.friends != undefined) {
                    script.friendsComponent.friends().then((users) => {
                        let friend = friendWithIndexExists(users, script.friendIndex);
                        if (friend != null) {
                            resolve(friend);
                        } else {
                            reject("Friend with index " + script.friendIndex + " doesn't exist for this user");
                        }
                    }).catch(
                        (e) => {
                            reject("Failed to fetch user");
                        }
                    );
                } else {
                    global.userContextSystem.getAllFriends(function (users) {
                        let friend = friendWithIndexExists(users, script.friendIndex);
                        if (friend != null) {
                            resolve(friend);
                        } else {
                            reject("Friend with index " + script.friendIndex + " doesn't exist for this user");
                        }
                    });
                }
                break;
            case 2:
                global.userContextSystem.getMyAIUser(function (user) {
                    resolve(user);
                });
                break;
        }
    });
}

/**
 * check if user exists
 * @param {SnapchatUser[]} friends 
 * @param {number} index 
 * @returns {SnapchatUser | null}
 */
function friendWithIndexExists(friends, index) {
    let usersWithBitmoji = friends.filter(user => user.hasBitmoji);
    if (usersWithBitmoji.length > index) {
        return friends[index];
    } else {
        return null;
    }
}

/**
 * get Bitmoji 3D resource
 * @param {Bitmoji3DOptions} options 
 * @returns {Promise<Bitmoji3DResource>}
 */
function getBitmojiResource(options) {
    return new Promise(function (resolve, reject) {
        try {
            if (options != null) {
                script.bitmojiModule.requestBitmoji3DResourceWithOptions(options, resolve);
            } else {
                // download for current user 
                script.bitmojiModule.requestBitmoji3DResource(resolve);
            }
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * download Bitmoji 3D assets
 * @param {Bitmoji3DResource} bitmoji3DResource 
 * @returns {Promise<GltfAsset>}
 */
function downloadGLTFAsset(bitmoji3DResource) {
    return new Promise(function (resolve, reject) {
        script.remoteMediaModule.loadResourceAsGltfAsset(
            bitmoji3DResource,
            resolve,
            reject
        );
    });
}
/**
 * 
 * @param {GltfAsset} gltfAsset 
 * @returns {Promise<SceneObject>}
 */
function instantiateGLTFAssetAsync(gltfAsset) {
    return new Promise(function (resolve, reject) {
        bitmojiGltfAsset = gltfAsset
        let settings = GltfSettings.create();
        settings.convertMetersToCentimeters = true;
        gltfAsset.tryInstantiateAsync(thisObject, script.materialHolder, resolve, reject, onLoadingUpdate, settings);
    });
}
/**
 * 
 * @param {string} e 
 */
function onDownloadFailed(e) {
    debugPrint("Error ", e);
    script.onDownloadFailed.trigger(e);
    isLoading = false;
}

/**
 * 
 * @param {SceneObject} sceneObject 
 */
function onDownloadSucceeded(sceneObject) {
    if (avatar) {
        onDestroy()
    }
    debugPrint("Info ", "Bitmoji avatar downloaded.");
    avatar = sceneObject;
    processAvatar();
    isLoading = false;
    script.onDownloaded.trigger(avatar);
}

/**
 * 
 * @param {number} status 
 */
function onLoadingUpdate(status) {
    //debugPrint("Loading", status.toFixed(2));
}

/**
 * configure scene once gltf asset is downloaded
 * @param {SceneObject} avatar 
 */
function processAvatar() {

    bitmojiMeshes = {};
    bitmojiJoints = {};

    buildJointMap(bitmojiJoints, avatar);

    let layer = thisObject.layer;

    Object.values(bitmojiMeshes).forEach(rmv => {
        rmv.sceneObject.layer = layer;
        rmv.meshShadowMode = castShadow ? MeshShadowMode.Caster : MeshShadowMode.None;
        rmv.setRenderOrder(script.renderOrder);
    });


    if (script.mixamoAnimation) {
        remap();
        addScaleCompensation();
    }
    avatar.setParent(thisObject);
}

/**
 * Rename joints names to mixamo joint names
 */
function remap() {
    for (let joint in bitmojiJoints) {
        if (mixamoBitmojiMap[joint]) {
            bitmojiJoints[joint].name = mixamoBitmojiMap[joint];
        }
    }
}

/**
 * Update Root/Hips Local Scale on the first frame
 */
function addScaleCompensation() {
    let bmRoot = bitmojiJoints["ROOT"];
    // create new scene object
    let so = global.scene.createSceneObject("Hips_SSC_Mixamo");
    so.setParent(bmRoot.getParent());
    //scale object down and scale hip up a 100
    so.getTransform().setLocalScale(vec3.one().uniformScale(0.01));
    let scale = bmRoot.getTransform().getLocalScale();
    bmRoot.getTransform().setLocalScale(scale.uniformScale(100));
    // set a parent - now hip position keys should be correct
    bmRoot.setParent(so);
}

/**
 * creates a map of child names -> child scene object
 * @param {object} m 
 * @param {SceneObject} root 
 * @returns 
 */
function buildJointMap(m, root) {
    for (let i = 0; i < root.getChildrenCount(); i++) {
        let child = root.getChild(i);
        let rmv = child.getComponent("RenderMeshVisual");
        if (!isNull(rmv)) {
            bitmojiMeshes[child.name] = rmv;
        }
        m[child.name] = child;
        buildJointMap(m, child);
    }
}
/**
 * 
 * @param {string} prefix 
 * @param {any} message 
 */
function debugPrint(prefix, message) {
    if (script.printDebug) {
        print(`${prefix}: ${message}`);
    }
}

/**
 * clean up scene objects created in runtime
 */
function onDestroy() {
    if (!isNull(avatar)) {
        avatar.destroy();
    }
    bitmojiJoints = {};
    bitmojiMeshes = {};
    bitmojiGltfAsset = {};
}

// api
script.download = downloadAvatar; // previous api for compatibility
script.downloadAvatar = downloadAvatar;
script.downloadAvatarForUser = downloadAvatarForUser;

/**
 * @returns {SnapchatUser}
 */
script.getUser = () => {
    return user;
};
/**
 * @returns {SceneObject}
 */
script.getExtras = () => {
    return bitmojiGltfAsset ? bitmojiGltfAsset.extras : null;
};

/**
 * @returns {number}
 */
script.getRenderOrder = () => {
    return renderOrder;
};
/**
 * @param {number} v 
 */
script.setRenderOrder = (v) => {
    renderOrder = v;
    Object.values(bitmojiMeshes).forEach(rmv => {
        rmv.setRenderOrder(renderOrder);
    });
};
/**
 * 
 * @param {boolean} v 
 */
script.setShadowsEnabled = (v) => {
    castShadow = v;
    Object.values(bitmojiMeshes).forEach(rmv => {
        rmv.meshShadowMode = castShadow ? MeshShadowMode.Caster : MeshShadowMode.None;
    });
};

script.getShadowsEnabled = () => {
    return castShadow;
};

/**
 * @param {LayerSet} v 
 */
script.setRenderLayer = (v) => {
    thisObject.layer = v;
    Object.values(bitmojiMeshes).forEach(rmv => {
        rmv.sceneObject.layer = v
    });
};

script.getRenderLayer = () => {
    return thisObject.layer;
};

script.createEvent("OnDestroyEvent").bind(onDestroy);
script.createEvent("OnStartEvent").bind(init);