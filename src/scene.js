class Scene {
    constructor() {
        this.objects = [];
        this.objCount = 0;

        this.opaqueIndexes = [];
        // TODO: find way of determining transparent obj render order
        this.transparentIndexes = [];
    }

    addObj(obj) {
        // checks if object already belongs to a scene
        if(obj.scene != null) {
            console.log(obj + 'already in a scene!');
            return;
        }
        // adds obj to this scene's mesh list
        this.objects.push(obj);
        this.objCount = this.objects.length;

        // tells obj it's in this scene
        obj.scene = this;
        obj.sceneMeshIndex = this.objCount - 1;

        // organizes obj based on transparency
        if(obj.transparent) this.transparentIndexes.push(this.objCount - 1);
        else this.opaqueIndexes.push(this.objCount - 1);
    }

    setObjTransparency(obj) {
        let correctList = this.opaqueIndexes;
        let wrongList = this.transparentIndexes;
        const objIndex = obj.sceneMeshIndex;
        if(obj.transparent) {
            correctList = this.transparentIndexes;
            wrongList = this.opaqueIndexes;
        }

        for(let i = 0; i < correctList.length; i++) {
            if(correctList[i] == objIndex) return; // in correct list
        }

        for(let i = 0; i < wrongList.length; i++) {
            if(wrongList[i] == objIndex) { // in wrong list
                wrongList.splice(i, 1);
                correctList.push(objIndex);
                return;
            }
        }

        // not in either list
        correctList.push(objIndex);
    }
}