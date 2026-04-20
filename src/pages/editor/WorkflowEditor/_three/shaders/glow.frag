// Node glow shader
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPulseSpeed;
uniform float uRadius;
uniform bool uIsSelected;
uniform bool uIsRunning;

void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    
    // Base glow falloff
    float glow = 1.0 - smoothstep(0.0, uRadius, dist);
    glow = pow(glow, 2.0);
    
    // Pulse animation
    float pulse = 1.0;
    if (uIsRunning) {
        pulse = 0.7 + sin(uTime * uPulseSpeed * 3.0) * 0.3;
    } else if (uIsSelected) {
        pulse = 0.8 + sin(uTime * uPulseSpeed) * 0.2;
    }
    
    // Ring effect for selected nodes
    float ring = 0.0;
    if (uIsSelected) {
        float ringDist = abs(dist - 0.35);
        ring = 1.0 - smoothstep(0.0, 0.05, ringDist);
        ring *= 0.5;
    }
    
    // Running animation ring
    float runningRing = 0.0;
    if (uIsRunning) {
        float animatedRadius = mod(uTime * 0.5, 0.5);
        float ringDist = abs(dist - animatedRadius);
        runningRing = 1.0 - smoothstep(0.0, 0.03, ringDist);
        runningRing *= (1.0 - animatedRadius * 2.0);
    }
    
    // Combine effects
    float alpha = (glow * uIntensity + ring + runningRing) * pulse;
    vec3 finalColor = uColor;
    
    // Brighten for running state
    if (uIsRunning) {
        finalColor *= 1.5;
    }
    
    gl_FragColor = vec4(finalColor, alpha);
}
