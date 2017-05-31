(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

THREE.Matrix4.elements.set = function(_elements) {
	console.log("setting elements");
};

Array.prototype.removeValue = function(name, value){
        var array = $.map(this, function(v,i){
            return v[name] === value ? null : v;
        });
        this.length = 0;
        this.push.apply(this, array);
};

Array.prototype.last = function(){
    return this[this.length - 1];
};

Array.prototype.first = function(){
    return this[0];
};

THREE.Group.prototype.setPickable = function() {
	
	function setPickableChild(child) {

		child.userData.pickable = true;

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setPickableChild(child.children[i]);
			}
		}
	};
	setPickableChild(this);
};

THREE.Object3D.prototype.setType = function(_type) {
	
	function setTypeChild(child) {

		child.userData.type = _type;

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setTypeChild(child.children[i]);
			}
		}
	};
	setTypeChild(this);
};

THREE.Object3D.prototype.setUserData = function(_key, _data) {
	
	function setUserDataChild(child) {

		child.userData[_key] = _data;

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setUserDataChild(child.children[i]);
			}
		}
	};
	setUserDataChild(this);
};

THREE.Object3D.prototype.setName = function(_name) {
	
	function setNameChild(child) {

		child.name = _name;

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setNameChild(child.children[i]);
			}
		}
	};
	setNameChild(this);
};

THREE.Object3D.prototype.setOpacity = function(_opacity) {
	
	function setOpacityChild(child) {

		if (child.material !== undefined)
			child.material.opacity = _opacity;

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setOpacityChild(child.children[i]);
			}
		}
	};
	setOpacityChild(this);
};

THREE.Object3D.prototype.setColor = function(_color) {
	
	function setColorChild(child) {

		if (child.material !== undefined)
			child.material.color.set(_color);

		if (child.children !== undefined) {

			for (var i = 0; i < child.children.length; ++i) {

				setColorChild(child.children[i]);
			}
		}
	};
	setColorChild(this);
};