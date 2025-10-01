// src/Pong3D.jsx - ¡Corrección de Rotación Aplicada!

import React, { useRef, useEffect } from 'react';
import { 
    Engine, Scene, Color4, FreeCamera, Vector3, 
    HemisphericLight, MeshBuilder, StandardMaterial, Color3, // Importamos Math.PI
} from '@babylonjs/core'; 

const Pong3D = ({ ball, player1, player2 }) => {
  const reactCanvas = useRef(null);

  useEffect(() => {
    if (!reactCanvas.current) return;

    const engine = new Engine(reactCanvas.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1); 

    // 3. Crear Cámara: Posicionada para una vista lateral (X-Z)
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -50), scene); 
    camera.setTarget(Vector3.Zero()); 

    // 4. Crear Luces
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene); 
    light.intensity = 0.7;

    // 5. Crear Geometría (Mallas)
    
    // Campo de juego: 80x60 unidades. (en el plano Y=0)
    const field = MeshBuilder.CreateGround("field", { width: 80, height: 60 }, scene); 
    field.material = new StandardMaterial("fieldMat", scene);
    field.material.diffuseColor = new Color3(0.1, 0.1, 0.2); 
    field.material.specularColor = new Color3(0, 0, 0); 
    
    // Paletas
    const paddleMat = new StandardMaterial("paddleMat", scene);
    paddleMat.diffusesColor = new Color3(0, 0.9, 0.9); 
    paddleMat.emissiveColor = new Color3(0, 0.5, 0.5); 
    
    // Paleta 1: Altura 1, largo 10, grosor 1.
    const paddle1Mesh = MeshBuilder.CreateBox("paddle1", { width: 1, height: 1, depth: 10 }, scene); 
    paddle1Mesh.material = paddleMat;
    paddle1Mesh.position.x = -39.5; 
    paddle1Mesh.position.y = 0.5; 
    // ROTACIÓN: Asegura que la dimensión de grosor (1) esté alineada con el borde (eje X)
    paddle1Mesh.rotation.y = Math.PI / 2; // <--- ¡ROTACIÓN CLAVE!
    
    // Paleta 2: 
    const paddle2Mesh = MeshBuilder.CreateBox("paddle2", { width: 1, height: 1, depth: 10 }, scene);
    paddle2Mesh.material = paddleMat;
    paddle2Mesh.position.x = 39.5; 
    paddle2Mesh.position.y = 0.5; 
    // ROTACIÓN:
    paddle2Mesh.rotation.y = Math.PI / 2; // <--- ¡ROTACIÓN CLAVE!
    
    // Pelota: 
    const ballMesh = MeshBuilder.CreateSphere("ball", { diameter: 2 }, scene);
    ballMesh.material = new StandardMaterial("ballMat", scene);
    ballMesh.material.diffuseColor = new Color3(1, 0.2, 0.2); 
    ballMesh.material.emissiveColor = new Color3(1, 0, 0); 
    ballMesh.position.y = 1.0; 

    // 6. Bucle de Renderizado con Escala (Factor 10)
    const updateMeshes = () => {
      // X (ancho del juego 0-800) -> X de Babylon (-40 a 40)
      ballMesh.position.x = (ball.x - 400) / 10; 
      // Y (alto del juego 0-600) -> Z de Babylon (-30 a 30)
      ballMesh.position.z = (ball.y - 300) / 10; 

      // Sincronizar las paletas
      // La posición Z final en 3D: (Centro 2D - 300) / 10
      paddle1Mesh.position.z = ((player1.y + 50) - 300) / 10; 
      paddle2Mesh.position.z = ((player2.y + 50) - 300) / 10; 
    };

    engine.runRenderLoop(() => {
      if (ball) {
        updateMeshes();
      }
      scene.render();
    });

    // 7. Manejar Redimensionamiento
    const resize = () => scene.getEngine().resize();
    window.addEventListener('resize', resize);

    // 8. Función de limpieza
    return () => {
      window.removeEventListener('resize', resize);
      engine.dispose();
    };
  }, [ball, player1, player2]); 

  return <canvas ref={reactCanvas} width={800} height={600} />;
};

export default Pong3D;
