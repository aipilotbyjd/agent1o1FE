// Infinite grid shader with animation
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float uTime;
uniform vec3 uGridColor;
uniform float uGridSize;
uniform float uGridThickness;
uniform float uFadeDistance;
uniform float uPulseIntensity;
uniform float uPulseSpeed;

float grid(vec2 st, float res) {
    vec2 grid = abs(fract(st * res - 0.5) - 0.5) / fwidth(st * res);
    return 1.0 - min(min(grid.x, grid.y), 1.0);
}

void main() {
    vec2 worldUv = vWorldPosition.xz / uGridSize;
    
    // Main grid
    float mainGrid = grid(worldUv, 1.0) * uGridThickness;
    
    // Secondary grid (larger squares)
    float secondaryGrid = grid(worldUv, 0.1) * uGridThickness * 2.0;
    
    // Combine grids
    float gridPattern = max(mainGrid, secondaryGrid);
    
    // Distance fade
    float dist = length(vWorldPosition.xz);
    float fade = 1.0 - smoothstep(0.0, uFadeDistance, dist);
    
    // Pulse animation
    float pulse = 1.0 + sin(uTime * uPulseSpeed - dist * 0.1) * uPulseIntensity;
    
    // Final color
    vec3 color = uGridColor * gridPattern * fade * pulse;
    float alpha = gridPattern * fade * 0.6;
    
    gl_FragColor = vec4(color, alpha);
}
