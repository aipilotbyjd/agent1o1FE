// Connection beam shader
varying vec2 vUv;
varying float vProgress;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uFlowSpeed;
uniform float uGlowWidth;
uniform bool uIsActive;

void main() {
    // Distance from center line
    float distFromCenter = abs(vUv.y - 0.5) * 2.0;
    
    // Base beam glow
    float beam = 1.0 - smoothstep(0.0, uGlowWidth, distFromCenter);
    beam = pow(beam, 1.5);
    
    // Core line
    float core = 1.0 - smoothstep(0.0, uGlowWidth * 0.3, distFromCenter);
    
    // Flow animation
    float flow = 0.0;
    if (uIsActive) {
        float flowPos = fract(vUv.x - uTime * uFlowSpeed);
        flow = smoothstep(0.0, 0.1, flowPos) * smoothstep(0.3, 0.2, flowPos);
        flow *= 0.5;
    }
    
    // Particle dots along the beam
    float particles = 0.0;
    if (uIsActive) {
        float particleSpacing = 0.15;
        float particlePos = mod(vUv.x + uTime * uFlowSpeed * 0.5, particleSpacing);
        float particleDist = length(vec2(particlePos - particleSpacing * 0.5, vUv.y - 0.5));
        particles = 1.0 - smoothstep(0.0, 0.02, particleDist);
        particles *= step(distFromCenter, 0.1);
    }
    
    // Edge fade
    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    
    // Combine
    float alpha = (beam * 0.3 + core * 0.4 + flow + particles) * uIntensity * edgeFade;
    
    // Color with slight variation
    vec3 finalColor = uColor;
    if (uIsActive) {
        finalColor = mix(uColor, vec3(1.0), flow * 0.3 + particles * 0.5);
    }
    
    gl_FragColor = vec4(finalColor, alpha);
}
