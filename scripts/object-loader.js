var loader = new THREE.ObjectLoader();
      loader.load(
          "https://simonberggren.github.io/static/Capacitor.json",
          function (obj) {
          },
          function (progress) {
              //console.log( (progress.loaded / progress.total * 100) + '% loaded' );
          },
          function (error) {
              console.error( 'An error happened loading an object!' );
          }
      );