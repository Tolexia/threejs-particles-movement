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

    vec3 pos_initial = particle.xyz;
    

    // Strength
    float strength = simplexNoise4d(vec4(base.xyz, time + 1.0));
    float influence = (uFlowFieldInfluence - 0.5) * (- 1.0);
    strength = smoothstep(influence, 1.0, strength);

    // Direction towards mouse
    vec3 mouseDirection = vec3(uMouse.x * uResolution.x, uMouse.y * uResolution.y, 0.0) - particle.xyz;
    mouseDirection = normalize(mouseDirection);

    vec3 directionFromZero = particle.xyz - vec3(0.0, 0.0, 0.0) ;
    directionFromZero = normalize(directionFromZero);

    vec3 directionToBase = base.xyz - particle.xyz;
    directionToBase = normalize(directionToBase);

    // Original flow field
    vec3 flowField = vec3(
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
    );
    flowField = normalize(flowField);

    // vec3 targetDirection = mouseDirection;
    vec3 targetDirection = directionFromZero;
    
    if(uMouse == vec2(0.0)) {
        targetDirection = directionToBase;
    }

    float directionInfluence = 0.3;
    if(uMouse == vec2(0.0)) {
        directionInfluence = 0.6;
    }   

    // Mix between flow field and mouse direction
    vec3 finalDirection = mix(flowField, targetDirection, directionInfluence);
    finalDirection = normalize(finalDirection);

    if(uMouse != vec2(0.0))
    {
        particle.xyz += finalDirection * uDeltaTime * strength * uFlowFieldStrength;
        particle.a = abs(length(particle.xyz - pos_initial)) * 150.;
    }
    else
    {
        if(length(particle.xyz - base.xyz) > 0.1)
        {
            particle.xyz += finalDirection * uDeltaTime * (uFlowFieldStrength * 2.);
            particle.a = abs(length(base.xyz - particle.xyz)) * 150. ;
        }
        else{
            particle.xyz = base.xyz;
            particle.a = 0.0;
        }
    }
        
    
    gl_FragColor = particle;
}`