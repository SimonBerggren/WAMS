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