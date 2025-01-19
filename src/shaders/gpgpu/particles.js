import simplexNoise4d from '../includes/simplexNoise4d.js'

export default`uniform float uTime;
uniform float uDeltaTime;
uniform float uSpeed;
uniform sampler2D uBase;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform vec2 uMouse;
uniform vec2 uResolution;

${simplexNoise4d}

void main()
{
    float time = uTime * uSpeed;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);
    
    // Dead
    if(particle.a >= 1.0)
    {
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    }

    // Alive
    else
    {
        // Strength
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        // float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
        float influence = (uFlowFieldInfluence) ;
        strength = smoothstep(influence, 1.0, strength);

        // Direction vers la souris
        vec3 mouseDirection = vec3(uMouse.x * uResolution.x, uMouse.y * uResolution.y, 0.0) - particle.xyz;
        mouseDirection = normalize(mouseDirection);

        // Flow field original
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
        );
        flowField = normalize(flowField);

        // Mélange entre le flowfield et la direction de la souris
        vec3 finalDirection = mix(flowField, mouseDirection, 0.65);
        finalDirection = normalize(finalDirection);

        if(uMouse != vec2(0.0))
        {
            particle.xyz += finalDirection * uDeltaTime * uFlowFieldStrength;
        }
        
       

        // Decay
        particle.a += uDeltaTime * 0.2;
    }
    
    gl_FragColor = particle;
}`