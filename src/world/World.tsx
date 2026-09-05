import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import fontUrl from 'dejavu-fonts-ttf/ttf/DejaVuSans.ttf?url';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GameId } from '../types';

const FONT = fontUrl;

export interface WorldProps {
  /** Intro fly-through or the explorable office. */
  mode?: 'cinematic' | 'office';
  /** Fired when the intro camera reaches the office. */
  onCinematicComplete?: () => void;
  /** Fired when the player presses E near a workstation. */
  onInteract?: (game: GameId) => void;
  /** Completed stations receive a small visual celebration. */
  completed?: readonly GameId[];
  /** Compatibility conveniences for a compact app shell. */
  cinematic?: boolean;
  onCinematicEnd?: () => void;
  playerColor?: string;
  onCollect?: () => void;
  paused?: boolean;
}

type Station = {
  id: GameId;
  title: string;
  color: string;
  position: [number, number, number];
  icon: string;
};

const STATIONS: Station[] = [
  { id: 'inbox', title: 'INBOX ZERO', color: '#38d9ff', position: [-6, 0, -4], icon: '@' },
  { id: 'bugs', title: 'BUG SQUASH', color: '#ff5b9d', position: [6, 0, -4], icon: '!' },
  { id: 'server', title: 'SERVER ROOM', color: '#9cff57', position: [-6, 0, 5], icon: '>' },
  { id: 'coffee', title: 'COFFEE RUSH', color: '#ffb84d', position: [6, 0, 5], icon: '☕' },
];
const CUBES: [number, number, number][] = [
  [-10, 0, -1],
  [-3, 0, -7],
  [3, 0, -7],
  [10, 0, -1],
  [-10, 0, 4],
  [-3, 0, 8],
  [3, 0, 8],
  [10, 0, 4],
  [0, 0, 0],
  [0, 0, 7],
  [-8, 0, -7],
  [8, 0, -7],
];

const box = (args: [number, number, number], color: string) => (
  <mesh castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.72} />
  </mesh>
);

function Workstation({ station, completed }: { station: Station; completed: boolean }) {
  return (
    <group position={station.position}>
      <group position={[0, 0.65, 0]}>
        {box([3.2, 0.25, 1.45], '#5e3f85')}
        <group position={[-1.25, -0.75, 0]}>{box([0.22, 1.5, 1.15], '#37294f')}</group>
        <group position={[1.25, -0.75, 0]}>{box([0.22, 1.5, 1.15], '#37294f')}</group>
        <group position={[0, 0.95, -0.32]}>
          {box([1.8, 1.15, 0.16], '#17152a')}
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[1.55, 0.86]} />
            <meshStandardMaterial
              color={station.color}
              emissive={station.color}
              emissiveIntensity={1.8}
            />
          </mesh>
          <Text
            font={FONT}
            position={[0, 0, 0.105]}
            fontSize={0.48}
            color="#11101d"
            anchorX="center"
            anchorY="middle"
          >
            {station.icon}
          </Text>
        </group>
        <group position={[0, -0.72, 1.25]}>
          {box([1.15, 0.14, 1.05], '#4a3764')}
          <group position={[0, -0.85, 0.2]}>{box([0.18, 1.7, 0.18], '#29213a')}</group>
        </group>
      </group>
      <Float speed={2.3} floatIntensity={0.18}>
        <group position={[0, 3.25, 0]}>
          <Text
            font={FONT}
            fontSize={0.42}
            color={completed ? '#ffe96a' : station.color}
            anchorX="center"
            outlineWidth={0.025}
            outlineColor="#171027"
          >
            {completed ? `★ ${station.title} ★` : station.title}
          </Text>
          <Text
            font={FONT}
            position={[0, -0.48, 0]}
            fontSize={0.22}
            color="#f5efff"
            anchorX="center"
          >
            WALK UP + PRESS E
          </Text>
        </group>
      </Float>
      <pointLight
        position={[0, 2.2, 0]}
        color={station.color}
        intensity={completed ? 8 : 4}
        distance={5}
      />
    </group>
  );
}

function Office({
  completed,
  collectedCubes,
}: {
  completed: readonly GameId[];
  collectedCubes: ReadonlySet<number>;
}) {
  const ceilingLights = useMemo(() => [-8, -4, 0, 4, 8], []);
  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[30, 25]} />
        <meshStandardMaterial color="#302744" roughness={0.85} />
      </mesh>
      {Array.from({ length: 15 }, (_, x) =>
        Array.from({ length: 12 }, (_, z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x * 2 - 14, 0.012, z * 2 - 11]}
            rotation-x={-Math.PI / 2}
          >
            <planeGeometry args={[1.94, 1.94]} />
            <meshStandardMaterial color={(x + z) % 2 ? '#362b4b' : '#2d253e'} />
          </mesh>
        )),
      )}
      <group position={[0, 2, -10]}>{box([30, 4, 0.35], '#513f6a')}</group>
      <group position={[-14.8, 2, 0]}>{box([0.35, 4, 20], '#513f6a')}</group>
      <group position={[14.8, 2, 0]}>{box([0.35, 4, 20], '#513f6a')}</group>
      {ceilingLights.map((x) => (
        <group key={x} position={[x, 3.8, -8]}>
          {box([2.8, 0.1, 0.8], '#fff4bf')}
          <pointLight color="#d9e7ff" intensity={5} distance={8} />
        </group>
      ))}
      {STATIONS.map((station) => (
        <Workstation
          key={station.id}
          station={station}
          completed={completed.includes(station.id)}
        />
      ))}
      {CUBES.map((position, index) =>
        collectedCubes.has(index) ? null : (
          <Float key={`cube-${index}`} speed={2 + (index % 3)}>
            <mesh position={[position[0], 1.1, position[2]]} rotation={[0.5, 0.5, 0]}>
              <boxGeometry args={[0.42, 0.42, 0.42]} />
              <meshStandardMaterial color="#ffe46b" emissive="#ff9d3d" emissiveIntensity={2} />
            </mesh>
          </Float>
        ),
      )}
      <group position={[0, 0.75, -5]}>
        {box([3.4, 1.5, 0.45], '#26325a')}
        <Text font={FONT} position={[0, 0.15, 0.24]} fontSize={0.44} color="#fff36c">
          BLOCKWORKS
        </Text>
        <Text font={FONT} position={[0, -0.38, 0.24]} fontSize={0.18} color="#79e7ff">
          PRODUCTIVITY ARCADE
        </Text>
      </group>
      {[
        [-11, -6],
        [11, -6],
        [-11, 7],
        [11, 7],
      ].map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <group position={[0, 0.45, 0]}>{box([1.1, 0.9, 1.1], '#da577d')}</group>
          <group position={[0, 1.45, 0]}>{box([0.75, 1.25, 0.75], '#4cc98b')}</group>
        </group>
      ))}
    </group>
  );
}

function Player({
  onInteract,
  onCollect,
  paused,
  playerColor = '#ffd951',
  collectedCubes,
  onCubeCollect,
}: Pick<WorldProps, 'onInteract' | 'onCollect' | 'paused' | 'playerColor'> & {
  collectedCubes: ReadonlySet<number>;
  onCubeCollect: (index: number) => void;
}) {
  const player = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const grounded = useRef(true);
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0.48);
  const dragging = useRef(false);
  const collectedRef = useRef(new Set(collectedCubes));
  const [nearby, setNearby] = useState<Station | null>(null);
  const { camera, gl } = useThree();

  useEffect(() => {
    collectedRef.current = new Set(collectedCubes);
  }, [collectedCubes]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code);
      if (event.code === 'KeyE' && !event.repeat && nearby) onInteract?.(nearby.id);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [nearby, onInteract]);

  useEffect(() => {
    const canvas = gl.domElement;
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || paused) return;
      dragging.current = true;
      canvas.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging.current || paused) return;
      cameraYaw.current -= event.movementX * 0.005;
      cameraPitch.current = THREE.MathUtils.clamp(
        cameraPitch.current - event.movementY * 0.003,
        0.2,
        0.95,
      );
    };
    const pointerUp = (event: PointerEvent) => {
      dragging.current = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
    };
  }, [gl, paused]);

  useEffect(() => {
    if (paused) {
      keys.current.clear();
      velocity.current.set(0, 0, 0);
      dragging.current = false;
    }
  }, [paused]);

  useFrame((_, delta) => {
    if (!player.current || paused) return;
    const input = new THREE.Vector3(
      Number(keys.current.has('KeyD') || keys.current.has('ArrowRight')) -
        Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft')),
      0,
      Number(keys.current.has('KeyS') || keys.current.has('ArrowDown')) -
        Number(keys.current.has('KeyW') || keys.current.has('ArrowUp')),
    );
    const dt = Math.min(delta, 0.05);
    const moving = input.lengthSq() > 0;
    if (moving) {
      input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw.current);
      const speed = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 8.5 : 5.5;
      velocity.current.lerp(input.multiplyScalar(speed), 1 - Math.exp(-dt * 12));
    } else {
      velocity.current.multiplyScalar(Math.exp(-dt * 10));
    }
    if (velocity.current.lengthSq() > 0.01) {
      const previous = player.current.position.clone();
      player.current.position.addScaledVector(velocity.current, dt);
      // Keep a comfortable collision radius around the desks and progression board.
      const blocked = STATIONS.some(
        ({ position }) =>
          Math.abs(player.current!.position.x - position[0]) < 1.95 &&
          Math.abs(player.current!.position.z - position[2]) < 1.35,
      );
      const boardBlocked =
        Math.abs(player.current.position.x) < 2.15 &&
        Math.abs(player.current.position.z + 5) < 0.75;
      if (blocked || boardBlocked) player.current.position.copy(previous);
      player.current.rotation.y = THREE.MathUtils.lerp(
        player.current.rotation.y,
        Math.atan2(velocity.current.x, velocity.current.z),
        1 - Math.exp(-dt * 14),
      );
    }
    if (grounded.current && keys.current.has('Space')) {
      verticalVelocity.current = 7;
      grounded.current = false;
    }
    verticalVelocity.current -= 19 * dt;
    player.current.position.y += verticalVelocity.current * dt;
    if (player.current.position.y <= 0 || player.current.position.y < -2) {
      player.current.position.y = 0;
      verticalVelocity.current = 0;
      grounded.current = true;
    }
    player.current.position.x = THREE.MathUtils.clamp(player.current.position.x, -13.2, 13.2);
    player.current.position.z = THREE.MathUtils.clamp(player.current.position.z, -8.8, 10.2);

    const walkPhase = performance.now() * 0.012;
    const stride = moving && grounded.current ? Math.sin(walkPhase) * 0.55 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = stride;
    if (rightLeg.current) rightLeg.current.rotation.x = -stride;
    if (body.current)
      body.current.position.y =
        moving && grounded.current ? Math.abs(Math.sin(walkPhase)) * 0.06 : 0;

    const distance = 8;
    const horizontalDistance = Math.cos(cameraPitch.current) * distance;
    const targetCamera = player.current.position
      .clone()
      .add(
        new THREE.Vector3(
          Math.sin(cameraYaw.current) * horizontalDistance,
          2.2 + Math.sin(cameraPitch.current) * distance,
          Math.cos(cameraYaw.current) * horizontalDistance,
        ),
      );
    // Prevent the follow camera passing through the three solid perimeter walls.
    targetCamera.x = THREE.MathUtils.clamp(targetCamera.x, -14.35, 14.35);
    targetCamera.z = Math.max(targetCamera.z, -9.55);
    camera.position.lerp(targetCamera, 1 - Math.exp(-dt * 8));
    camera.lookAt(player.current.position.clone().add(new THREE.Vector3(0, 1, 0)));
    const closest = STATIONS.reduce<Station | null>((best, station) => {
      const distance = player.current!.position.distanceTo(new THREE.Vector3(...station.position));
      return distance < 3.5 &&
        (!best ||
          distance < player.current!.position.distanceTo(new THREE.Vector3(...best.position)))
        ? station
        : best;
    }, null);
    if (closest?.id !== nearby?.id) setNearby(closest);
    CUBES.forEach((position, index) => {
      if (
        !collectedRef.current.has(index) &&
        player.current!.position.distanceTo(new THREE.Vector3(...position)) < 1.2
      ) {
        collectedRef.current.add(index);
        onCubeCollect(index);
        onCollect?.();
      }
    });
  });

  return (
    <group ref={player} position={[0, 0, 3]}>
      <group ref={body}>
        <group position={[0, 1.05, 0]}>{box([0.8, 1.25, 0.55], playerColor)}</group>
        <group position={[0, 2, 0]}>{box([0.72, 0.65, 0.65], '#f4a477')}</group>
      </group>
      <group ref={leftLeg} position={[-0.25, 0.7, 0]}>
        <group position={[0, -0.35, 0]}>{box([0.25, 0.7, 0.32], '#55b8ff')}</group>
      </group>
      <group ref={rightLeg} position={[0.25, 0.7, 0]}>
        <group position={[0, -0.35, 0]}>{box([0.25, 0.7, 0.32], '#55b8ff')}</group>
      </group>
      {nearby && (
        <Text
          font={FONT}
          position={[0, 2.8, 0]}
          fontSize={0.28}
          color="#ffffff"
          outlineWidth={0.03}
          outlineColor="#21162f"
        >
          [ E ] PLAY
        </Text>
      )}
    </group>
  );
}

function CinematicCamera({ onComplete }: { onComplete?: () => void }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const finished = useRef(false);
  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = Math.min(1, elapsed.current / 7);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.set(
      THREE.MathUtils.lerp(0, 10, Math.sin(eased * Math.PI) * 0.32),
      THREE.MathUtils.lerp(12, 6, eased),
      THREE.MathUtils.lerp(22, 9, eased),
    );
    camera.lookAt(0, 1.4, -1);
    if (t === 1 && !finished.current) {
      finished.current = true;
      onComplete?.();
    }
  });
  return null;
}

export function World({
  mode,
  cinematic,
  onInteract,
  onCinematicComplete,
  onCinematicEnd,
  playerColor,
  onCollect,
  paused,
  completed = [],
}: WorldProps) {
  const activeMode = mode ?? (cinematic ? 'cinematic' : 'office');
  const finishCinematic = onCinematicComplete ?? onCinematicEnd;
  const [collectedCubes, setCollectedCubes] = useState<Set<number>>(new Set());
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 7, 12], fov: 52 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#171226']} />
      <fog attach="fog" args={['#171226', 18, 35]} />
      <ambientLight intensity={1.25} color="#c9c4ff" />
      <directionalLight
        castShadow
        position={[6, 12, 8]}
        intensity={2.4}
        color="#fff0cf"
        shadow-mapSize={[1024, 1024]}
      />
      <Suspense fallback={null}>
        <Office completed={completed} collectedCubes={collectedCubes} />
        {activeMode === 'office' ? (
          <Player
            onInteract={onInteract}
            onCollect={onCollect}
            paused={paused}
            playerColor={playerColor}
            collectedCubes={collectedCubes}
            onCubeCollect={(index) =>
              setCollectedCubes((current) => {
                if (current.has(index)) return current;
                const next = new Set(current);
                next.add(index);
                return next;
              })
            }
          />
        ) : (
          <CinematicCamera onComplete={finishCinematic} />
        )}
      </Suspense>
    </Canvas>
  );
}

export default World;
