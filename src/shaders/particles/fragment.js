export default `varying vec3 vColor;
uniform sampler2D uBase;
uniform sampler2D uParticlesTexture;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;

void main()
{
    // vec4 base = texture(uBase, vUv);
    vec4 particle = texture(uParticlesTexture, vUv);
    float strength = smoothstep(0.0, 1.0, particle.a);


    vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), strength);
    // vec3 color = mix(uColorA, uColorB,strength); // colors not working, need to fix

    float distanceToCenter = length(gl_PointCoord - 0.5);
    if(distanceToCenter > 0.5)
        discard;
    
    
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`