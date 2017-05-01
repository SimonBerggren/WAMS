(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

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