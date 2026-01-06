import directionalLight from '../includes/directionalLight.js'

export default `uniform sampler2D uParticlesTexture;
uniform vec2 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uLightSpecularPower;
varying vec2 vUv;

${directionalLight}

void main()
{
    vec4 particle = texture(uParticlesTexture, vUv);

    float distanceToCenter = length(gl_PointCoord - 0.5);
    if(distanceToCenter > 0.5)
        discard;

    vec3 normal = normalize(particle.xyz- vec3(0.0));
    vec3 viewDirection = normalize(particle.xyz - cameraPosition);

    // Light
    vec3 light = vec3(0.5);

    light += directionalLight(
        uLightColor,               // Light color
        uLightIntensity,           // Light intensity,
        normal,                    // Normal
        vec3(uLightPosition, 2.0), // Light position
        viewDirection,             // View direction
        uLightSpecularPower        // Specular power
    );
    
    vec3 color = vec3(1., 1., 1.);
    color *= light;
    
    gl_FragColor = vec4(color, particle.a);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`