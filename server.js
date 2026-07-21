const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const { default: ModelClient } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// =========================================
// GITHUB MODELS CONFIGURATION
// =========================================

const endpoint = "https://models.github.ai/inference";

const modelName = "openai/gpt-4o";


// =========================================
// CHECK GITHUB TOKEN
// =========================================

if (!process.env.GITHUB_TOKEN) {

    console.error(
        "❌ ERROR: GITHUB_TOKEN is missing."
    );

    console.error(
        "Please add GITHUB_TOKEN to your .env file."
    );

    process.exit(1);
}


// =========================================
// MIDDLEWARE
// =========================================

app.use(
    cors()
);

app.use(
    express.json()
);


// =========================================
// SERVE FRONTEND
// =========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =========================================
// CREATE GITHUB MODELS CLIENT
// =========================================

const client =
    ModelClient(
        endpoint,
        new AzureKeyCredential(
            process.env.GITHUB_TOKEN
        )
    );


// =========================================
// CHAT API
// =========================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const {
                messages
            } = req.body;


            // Check messages

            if (
                !messages ||
                !Array.isArray(messages) ||
                messages.length === 0
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Messages are required."

                    });

            }


            console.log(
                "📩 Message received from user."
            );


            // =========================================
            // SEND REQUEST TO GITHUB MODELS
            // =========================================

            const response =
                await client
                    .path(
                        "/chat/completions"
                    )
                    .post({

                        body: {

                            messages:
                                messages,

                            model:
                                modelName,

                            temperature:
                                0.7,

                            max_tokens:
                                2000,

                            top_p:
                                1

                        }

                    });


            // =========================================
            // CHECK API RESPONSE
            // =========================================

            if (
                response.status !== "200"
            ) {

                console.error(
                    "❌ GitHub Models API Error:"
                );

                console.error(
                    response.body
                );


                return res
                    .status(
                        Number(
                            response.status
                        ) || 500
                    )
                    .json({

                        success: false,

                        error:
                            "GitHub Models API request failed.",

                        details:
                            response.body

                    });

            }


            // =========================================
            // GET AI RESPONSE
            // =========================================

            const aiMessage =
                response
                    .body
                    ?.choices
                    ?.at(0)
                    ?.message
                    ?.content;


            if (
                !aiMessage
            ) {

                return res
                    .status(500)
                    .json({

                        success: false,

                        error:
                            "AI returned an empty response."

                    });

            }


            console.log(
                "🤖 AI response generated successfully."
            );


            // =========================================
            // SEND RESPONSE TO FRONTEND
            // =========================================

            return res.json({

                success:
                    true,

                message:
                    aiMessage

            });


        } catch (error) {

            console.error(
                "❌ Server Error:"
            );

            console.error(
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Something went wrong while connecting to GitHub Models.",

                    details:
                        error.message

                });

        }

    }
);


// =========================================
// FRONTEND FALLBACK
// =========================================

app.get(
    "*",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// =========================================
// START SERVER
// =========================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "🚀 Assist AI is running!"
        );

        console.log(
            `🌐 Open: http://localhost:${PORT}`
        );

        console.log(
            "🤖 Model: " +
            modelName
        );

        console.log(
            "================================="
        );

        console.log("");

    }
);