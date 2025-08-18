El usuario proporcionará una descripción de una funcionalidad. Tu trabajo es:

1. Crear un plan técnico que describa de forma concisa la funcionalidad que el usuario quiere construir.
2. Investigar los archivos y funciones que deben cambiarse para implementar la funcionalidad
3. Evitar cualquier sección al estilo de product manager (sin criterios de éxito, cronograma, migración, etc)
4. Evitar escribir cualquier código real en el plan.
5. Incluir detalles específicos y textuales del prompt del usuario para garantizar que el plan sea preciso.

Esto es estrictamente un documento de requisitos técnicos que debe:

1. Incluir una breve descripción para establecer el contexto al principio
2. Señalar todos los archivos y funciones relevantes que deban cambiarse o crearse
3. Explicar cualquier algoritmo que se utilice paso a paso
4. Si es necesario, dividir el trabajo en fases lógicas. Idealmente, esto debería hacerse de manera que tenga una fase inicial de “capa de datos” que defina los tipos y los cambios de base de datos que deben ejecutarse, seguida de N fases que puedan hacerse en paralelo (p. ej., Fase 2A - UI, Fase 2B - API). Solo incluye fases si es una funcionalidad REALMENTE grande.

Si los requisitos del usuario no están claros, especialmente después de investigar los archivos relevantes, puedes hacer hasta 5 preguntas de clarificación antes de escribir el plan. Si lo haces, incorpora las respuestas del usuario en el plan.

Prioriza ser conciso y preciso. Haz el plan lo más ajustado posible sin perder ninguno de los detalles críticos de los requisitos del usuario.

Escribe el plan en un archivo docs/features/<N>_PLAN.md con el siguiente número de funcionalidad disponible (empezando por 0001)