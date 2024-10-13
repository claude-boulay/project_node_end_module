import zod from 'zod';

export const validUser = (req, res, next) => {
    let userSchema;

    if (req.url === "/register") {
        userSchema = zod.object({
            email: zod.string()
                .email("Email invalide."), // Message personnalisé pour un email invalide
            password: zod.string()
                .regex(new RegExp(".*[A-Z].*"), "Le mot de passe doit contenir une lettre majuscule.")
                .regex(new RegExp(".*[a-z].*"), "Le mot de passe doit contenir une lettre minuscule.")
                .regex(new RegExp(".*\\d.*"), "Le mot de passe doit contenir un chiffre.")
                .regex(new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"), "Le mot de passe doit contenir un caractère spécial.")
                .min(8, "Le mot de passe doit faire au moins 8 caractères."),
            role: zod.string().min(3).max(20).optional(),
        });
    }

    if (req.method === "PUT") {
        userSchema = zod.object({
            pseudo: zod.string().min(3).max(20).optional(),
            email: zod.string()
                .email("Email invalide.")
                .optional(), // Champ optionnel
            password: zod.string()
                .regex(new RegExp(".*[A-Z].*"), "Le mot de passe doit contenir une lettre majuscule.")
                .regex(new RegExp(".*[a-z].*"), "Le mot de passe doit contenir une lettre minuscule.")
                .regex(new RegExp(".*\\d.*"), "Le mot de passe doit contenir un chiffre.")
                .regex(new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"), "Le mot de passe doit contenir un caractère spécial.")
                .min(8, "Le mot de passe doit faire au moins 8 caractères").optional(),
            role: zod.string().min(3).max(20).optional(),
        });
    }

    if (req.method === "PUT" || req.url === "/register") {
        try {
            userSchema.parse(req.body);
            return next();
        } catch (err) {
            const formattedErrors = err.errors.map(error => ({
                message: error.message,
                path: error.path.join('.'), // Crée un chemin d'accès lisible
            }));
            return res.status(400).send({ errors: formattedErrors }); // Renvoie les erreurs formatées
        }
    }

    next(); // Continue pour d'autres requêtes qui ne nécessitent pas de validation
};
