
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
    body,
    validationResult
} = require("express-validator");

const app = express();

const PORT = 3000;

// ======================================================
// EJS SETUP
// ======================================================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

// Serve static files
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// Serve uploaded images
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// ======================================================
// UPLOAD DIRECTORIES
// ======================================================

const profileDirectory = path.join(
    __dirname,
    "uploads",
    "profile"
);

const othersDirectory = path.join(
    __dirname,
    "uploads",
    "others"
);

fs.mkdirSync(profileDirectory, {
    recursive: true
});

fs.mkdirSync(othersDirectory, {
    recursive: true
});

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "profilePic") {
            cb(null, profileDirectory);
        } else {
            cb(null, othersDirectory);
        }
    },

    filename: function (req, file, cb) {

        const extension = path.extname(
            file.originalname
        );

        const fileName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000000) +
            extension;

        cb(null, fileName);
    }

});

// ======================================================
// ALLOWED IMAGE TYPES
// ======================================================

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
];

const fileFilter = function (req, file, cb) {

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG, GIF and WEBP images are allowed."
            )
        );
    }
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 6
    }

});

// ======================================================
// GET REGISTRATION FORM
// ======================================================

app.get("/", function (req, res) {

    res.render("form", {

        errors: [],

        old: {
            username: "",
            email: "",
            gender: "",
            hobbies: []
        }

    });

});

// ======================================================
// POST REGISTRATION FORM
// ======================================================

app.post(

    "/register",

    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        },
        {
            name: "otherPics",
            maxCount: 5
        }
    ]),

    [

        // USERNAME
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required.")
            .isLength({
                min: 3,
                max: 20
            })
            .withMessage(
                "Username must be between 3 and 20 characters."
            )
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage(
                "Username can contain only letters, numbers and underscore."
            ),

        // PASSWORD
        body("password")
            .notEmpty()
            .withMessage("Password is required.")
            .isLength({
                min: 6
            })
            .withMessage(
                "Password must contain at least 6 characters."
            ),

        // CONFIRM PASSWORD
        body("confirmPassword")
            .notEmpty()
            .withMessage(
                "Please confirm your password."
            )
            .custom(function (value, { req }) {

                if (value !== req.body.password) {
                    throw new Error(
                        "Passwords do not match."
                    );
                }

                return true;
            }),

        // EMAIL
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required.")
            .isEmail()
            .withMessage(
                "Please enter a valid email address."
            ),

        // GENDER
        body("gender")
            .notEmpty()
            .withMessage(
                "Please select your gender."
            )
            .isIn([
                "Male",
                "Female",
                "Other"
            ])
            .withMessage(
                "Invalid gender selected."
            ),

        // HOBBIES
        body("hobbies")
            .custom(function (value) {

                if (!value) {
                    throw new Error(
                        "Please select at least one hobby."
                    );
                }

                return true;
            })

    ],

    function (req, res) {

        const errors = validationResult(req);

        // VALIDATION ERRORS
        if (!errors.isEmpty()) {

            return res
                .status(422)
                .render("form", {

                    errors: errors.array(),

                    old: {
                        username: req.body.username || "",
                        email: req.body.email || "",
                        gender: req.body.gender || "",
                        hobbies: getHobbies(req.body.hobbies)
                    }

                });
        }

        // PROFILE PICTURE VALIDATION
        if (
            !req.files ||
            !req.files.profilePic ||
            req.files.profilePic.length === 0
        ) {

            return res
                .status(422)
                .render("form", {

                    errors: [
                        {
                            msg: "Profile picture is required."
                        }
                    ],

                    old: {
                        username: req.body.username || "",
                        email: req.body.email || "",
                        gender: req.body.gender || "",
                        hobbies: getHobbies(req.body.hobbies)
                    }

                });
        }

        // GET UPLOADED FILES
        const profilePic = req.files.profilePic[0];

        const otherPics = req.files.otherPics || [];

        // CREATE USER DATA
        const userData = {

            username: req.body.username,

            email: req.body.email,

            gender: req.body.gender,

            hobbies: getHobbies(req.body.hobbies),

            profilePic: profilePic,

            otherPics: otherPics

        };

        // STORE USER DATA
        app.locals.registrationData = userData;

        // SHOW RESULT
        res.render("result", {
            user: userData
        });

    }

);

// ======================================================
// DOWNLOAD REGISTRATION DATA
// ======================================================

app.get("/download", function (req, res) {

    const user = app.locals.registrationData;

    // Check registration data
    if (!user) {

        return res
            .status(404)
            .send(
                "No registration data available. Please register first."
            );
    }

    // HOBBIES
    const hobbies = user.hobbies.join(", ");

    // BASE URL FOR IMAGES
    const baseUrl = `http://localhost:${PORT}`;

    // PROFILE IMAGE URL
    const profileImage =
        baseUrl +
        "/uploads/profile/" +
        user.profilePic.filename;

    // ==================================================
    // OTHER IMAGES
    // ==================================================

    let otherImagesHTML = "";

    if (user.otherPics.length === 0) {

        otherImagesHTML =
            "<p>No other pictures uploaded.</p>";

    } else {

        user.otherPics.forEach(function (pic) {

            otherImagesHTML += `
                <img
                    src="${baseUrl}/uploads/others/${pic.filename}"
                    width="150"
                    height="150"
                >
            `;

        });
    }

    // ==================================================
    // CREATE NORMAL HTML DOWNLOAD FILE
    // ==================================================

    const htmlContent = `

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Registration Details</title>
</head>

<body>

    <h1>Registration Details</h1>

    <p>All data has been submitted successfully.</p>

    <table>

        <tr>
            <th>Field</th>
            <th>Details</th>
        </tr>

        <tr>
            <td>Username</td>
            <td>${escapeHTML(user.username)}</td>
        </tr>

        <tr>
            <td>Email</td>
            <td>${escapeHTML(user.email)}</td>
        </tr>

        <tr>
            <td>Gender</td>
            <td>${escapeHTML(user.gender)}</td>
        </tr>

        <tr>
            <td>Hobbies</td>
            <td>${escapeHTML(hobbies)}</td>
        </tr>

        <tr>
            <td>Profile Picture</td>
            <td>
                <img
                    src="${profileImage}"
                    width="150"
                    height="150"
                >
            </td>
        </tr>

        <tr>
            <td>Other Pictures</td>
            <td>
                ${otherImagesHTML}
            </td>
        </tr>

    </table>

</body>
</html>

`;

    // ==================================================
    // SAVE FILE
    // ==================================================

    const downloadPath = path.join(
        __dirname,
        "registration-details.html"
    );

    fs.writeFileSync(
        downloadPath,
        htmlContent
    );

    // ==================================================
    // DOWNLOAD
    // ==================================================

    res.download(
        downloadPath,
        "registration-details.html",
        function (error) {

            if (error) {
                console.log(
                    "Download error:",
                    error
                );
            }

        }
    );

});

// ======================================================
// MULTER / GENERAL ERROR HANDLER
// ======================================================

app.use(function (err, req, res, next) {

    console.log("ERROR:", err.message);

    let message = "Something went wrong.";

    // FILE SIZE / COUNT ERRORS
    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {

            message =
                "Each image must be smaller than 2 MB.";

        } else if (err.code === "LIMIT_FILE_COUNT") {

            message =
                "Maximum 6 files can be uploaded.";

        } else {

            message = err.message;

        }

    } else if (err.message) {

        message = err.message;

    }

    // SHOW FORM AGAIN
    res
        .status(400)
        .render("form", {

            errors: [
                {
                    msg: message
                }
            ],

            old: {
                username: req.body?.username || "",
                email: req.body?.email || "",
                gender: req.body?.gender || "",
                hobbies: getHobbies(req.body?.hobbies)
            }

        });

});

// ======================================================
// HELPER FUNCTION
// ======================================================

function getHobbies(hobbies) {

    if (Array.isArray(hobbies)) {
        return hobbies;
    }

    if (hobbies) {
        return [hobbies];
    }

    return [];
}

// ======================================================
// HTML ESCAPE FUNCTION
// ======================================================

function escapeHTML(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, function () {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});