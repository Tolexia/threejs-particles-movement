export default `varying vec3 vColor;
uniform sampler2D uBase;
uniform sampler2D uParticlesTexture;

varying vec2 vUv;

void main()
{
    vec4 particle = texture(uParticlesTexture, vUv);

    float distanceToCenter = length(gl_PointCoord - 0.5);
    if(distanceToCenter > 0.5)
        discard;
    
    
    gl_FragColor = vec4(0.3, 0.2, 0.0, particle.a);
    // gl_FragColor = (vec3(particle))/ 2.;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`