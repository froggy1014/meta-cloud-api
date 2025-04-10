import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, Vector3 } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text, useGLTF, Loader, Center } from '@react-three/drei';
import { type Group, MathUtils, Object3D, Mesh, Material, MeshStandardMaterial } from 'three';
import { useMobile } from '../hooks/useMobile';

// 3D 모델을 불러오는 컴포넌트
function MetaLogoModel({ position = [0, 0, 0] as [number, number, number], url = '/model/meta_logo.glb' }) {
    const group = useRef<Group>(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    // GLTF 모델 불러오기
    // 참고: 실제 사용 시에는 url에 실제 모델 파일 경로를 지정해야 합니다
    const { scene, nodes, materials } = useGLTF(url);

    useEffect(() => {
        if (scene) {
            // 모델이 로드되면 상태 업데이트
            setModelLoaded(true);

            // 필요한 경우 모델의 포지션, 스케일 또는 회전을 조정할 수 있습니다
            scene.scale.set(1, 1, 1);
            scene.rotation.set(0, 0, 0);

            // 모델의 모든 메시에 그림자 설정
            scene.traverse((child) => {
                if (child.type === 'Mesh') {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // 필요한 경우 기존 재질을 향상시킬 수 있습니다
                    if ((child as Mesh).material instanceof MeshStandardMaterial) {
                        const material = (child as Mesh).material as MeshStandardMaterial;
                        material.roughness = 0.1;
                        material.metalness = 0.9;
                        material.envMapIntensity = 1.2;
                    }
                }
            });
        }
    }, [scene]);

    useFrame((state) => {
        if (!group.current) return;
        group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, (state.mouse.x * Math.PI) / 10, 0.05);
        group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, (state.mouse.y * Math.PI) / 10, 0.05);
    });

    // 폴백 컴포넌트 - 모델이 아직 로드되지 않았을 때 표시할 내용
    if (!modelLoaded) {
        return (
            <group ref={group} position={position}>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#0866FF" wireframe />
                </mesh>
            </group>
        );
    }

    return (
        <group ref={group} position={position}>
            <primitive object={scene.clone()} />
        </group>
    );
}

function FloatingMessages() {
    const messages = [
        // Main WhatsApp terms - positioned more widely
        { text: 'WhatsApp', position: [6, 1, -5], color: '#1DA851', fontSize: 0.8 },
        { text: 'Cloud API', position: [8, 2.5, -4], color: '#1DA851', fontSize: 0.8 },

        // Core API components - spread out much wider horizontally
        { text: 'Messages', position: [-8, 0.5, -3], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Webhooks', position: [0, 2, -6], color: '#1DA851', fontSize: 0.7 },
        { text: 'Phone Numbers', position: [-7, -1.5, -5], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Block Users', position: [7, -3, -4], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Payments API', position: [4, -4, -3], color: '#1DA851', fontSize: 0.7 },
        { text: 'Products & Services', position: [-6, 3.5, -5], color: '#1C8D4C', fontSize: 0.6 },

        // Additional Cloud API related terms - wider distribution
        { text: 'Graph API', position: [9, 0, -4], color: '#1DA851', fontSize: 0.65 },
        { text: 'Business Portfolio', position: [-9, 2, -4], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'WABA', position: [0, -3, -4.5], color: '#1DA851', fontSize: 0.7 },
        { text: 'Templates', position: [-4, 4, -5], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Throughput', position: [6, -2, -3.5], color: '#1DA851', fontSize: 0.65 },
        { text: 'Rate Limits', position: [-6, -2, -4], color: '#1C8D4C', fontSize: 0.65 },
        { text: 'Encryption', position: [5, 3, -3], color: '#1DA851', fontSize: 0.65 },
        { text: 'WhatsApp Manager', position: [-5, -4, -4], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Authentication', position: [0, -5, -5], color: '#1DA851', fontSize: 0.6 },
        { text: 'HTTP Protocol', position: [10, -1.5, -5], color: '#1C8D4C', fontSize: 0.6 },
        { text: 'Access Tokens', position: [-10, 3, -6], color: '#1DA851', fontSize: 0.6 },
        { text: 'Permissions', position: [7, 4, -4], color: '#1C8D4C', fontSize: 0.6 },

        // Extended additional terms - wider horizontal distribution
        { text: 'System User Tokens', position: [-8.5, 1, -4], color: '#1DA851', fontSize: 0.5 },
        { text: 'Business Integration', position: [9.5, 1, -6], color: '#1C8D4C', fontSize: 0.5 },
        { text: 'Quality Rating', position: [2, 5, -6], color: '#1DA851', fontSize: 0.55 },
        { text: 'Security', position: [-3, -6, -5], color: '#1C8D4C', fontSize: 0.65 },
        { text: 'Versioning', position: [8, -4, -6], color: '#1DA851', fontSize: 0.55 },
        { text: 'Data Privacy', position: [-7, -3, -7], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'Message Templates', position: [9, 3, -7], color: '#1DA851', fontSize: 0.55 },
        { text: 'Template Messages', position: [-5, 0, -8], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'Signal Protocol', position: [4, -5, -7], color: '#1DA851', fontSize: 0.55 },
        { text: 'Media Messages', position: [-8, -5, -6], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'Pair Rate Limit', position: [10, -2, -8], color: '#1DA851', fontSize: 0.5 },
        { text: 'Test Resources', position: [-9, 4, -7], color: '#1C8D4C', fontSize: 0.5 },
        { text: 'Scaling', position: [7, 6, -6], color: '#1DA851', fontSize: 0.6 },
        { text: 'WhatsApp Business', position: [-4, 5, -8], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'Higher Throughput', position: [3, -7, -6], color: '#1DA851', fontSize: 0.5 },
        { text: 'Capacity Limit', position: [-6, 6, -9], color: '#1C8D4C', fontSize: 0.5 },
        { text: 'Free-form Messages', position: [8, 5, -10], color: '#1DA851', fontSize: 0.5 },
        { text: 'Metrics', position: [-10, -1, -8], color: '#1C8D4C', fontSize: 0.65 },

        // Additional wide-spread terms to fill the expanded horizontal space
        { text: 'TLS Encryption', position: [-10, 5, -7], color: '#1DA851', fontSize: 0.5 },
        { text: 'Business Management', position: [10, 6, -9], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'App Dashboard', position: [-7, 7, -10], color: '#1DA851', fontSize: 0.55 },
        { text: 'Meta Business Suite', position: [9, -6, -8], color: '#1C8D4C', fontSize: 0.5 },
        { text: 'Webhook Servers', position: [-9, -6, -9], color: '#1DA851', fontSize: 0.55 },
        { text: 'Message Status', position: [7, 0, -10], color: '#1C8D4C', fontSize: 0.55 },
        { text: 'Business Phone Number', position: [-10, 0, -5], color: '#1DA851', fontSize: 0.45 },
        { text: 'Test WABA', position: [10, 3, -6], color: '#1C8D4C', fontSize: 0.55 },
    ];

    return (
        <>
            {messages.map((msg, index) => (
                <Float
                    key={index}
                    speed={5} // Even faster
                    rotationIntensity={0.7} // More rotation
                    floatIntensity={2.5} // More float
                    position={msg.position as Vector3}
                >
                    <Text
                        color={msg.color}
                        fontSize={msg.fontSize}
                        anchorX="center"
                        anchorY="middle"
                        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                        letterSpacing={0.05}
                    >
                        {msg.text}
                    </Text>
                </Float>
            ))}
        </>
    );
}

function Scene() {
    const { camera } = useThree();
    const isMobile = useMobile();

    useEffect(() => {
        camera.position.set(0, 0, isMobile ? 8 : 6);
    }, [camera, isMobile]);

    return (
        <>
            {/* 고급스러운 조명 설정 */}
            <ambientLight intensity={0.3} />
            <spotLight
                position={[5, 5, 5]}
                angle={0.15}
                penumbra={1}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <spotLight position={[-5, 5, 3]} angle={0.3} penumbra={0.8} intensity={1.2} color="#ffffff" castShadow />
            <pointLight position={[0, 3, 5]} intensity={0.6} color="#ffffff" />
            <pointLight position={[0, -3, -5]} intensity={0.4} color="#4285f4" />

            {/* 3D 모델로 메타 로고 렌더링 */}
            <Center>
                <MetaLogoModel position={[0, 0, 0]} url="/model/meta_logo.glb" />
            </Center>

            {/* 주변 요소 */}
            <FloatingMessages />
            <Environment preset="studio" />
        </>
    );
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E1A] via-[#080E1A] to-black">
            <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
                <color attach="background" args={['#080E1A']} />
                <fog attach="fog" args={['#080E1A', 5, 20]} />
                <Scene />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    // autoRotate={true}
                    // autoRotateSpeed={0.3}
                    rotateSpeed={0.5}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.8}
                    minDistance={3}
                    maxDistance={3}
                />
            </Canvas>

            {/* 로딩 인디케이터 추가 */}
            <Loader
                containerStyles={{ background: 'rgba(8, 14, 26, 0.8)' }}
                dataInterpolation={(p) => `모델 로딩중... ${p.toFixed(0)}%`}
                dataStyles={{ color: '#ffffff', fontSize: '1rem', fontFamily: 'Arial' }}
                barStyles={{ backgroundColor: '#0866FF' }}
            />
        </div>
    );
}
