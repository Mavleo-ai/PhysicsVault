import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return Response.json({
        success: false,
        error: "Message missing"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
      You are PhysicsVault AI, an elite JEE/NEET tutor.
      Solve Physics, Chemistry, and Maths doubts with:
      - step-by-step explanations
      - formulas
      - derivations
      - concise clarity
      - numerical solving

      CRITICAL EQUATION RULES:
      - You MUST format all mathematical expressions, equations, and chemical formulas using KaTeX / LaTeX format.
      - Use double dollar signs "$$" for display/block equations, e.g. $$E = mc^2$$.
      - Use single dollar signs "$" for inline mathematical parameters or variables, e.g. $T^2$ or $x \\to c$.
      - Avoid plain-text shortcuts for expressions. Deliver beautifully typeset equations.

      Student Question:
      ${message}
    `);

    const response = await result.response;
    const text = response.text();

    return Response.json({
      success: true,
      reply: text,
    });
  } catch (error) {
    console.error("PhysicsVault Gemini Endpoint Error:", error);
    const errorStr = (error.message || "").toLowerCase();
    let friendlyError = "AI Error";
    if (errorStr.includes("503") || errorStr.includes("unavailable") || errorStr.includes("quota") || errorStr.includes("limit")) {
      friendlyError = "AI Tutor is busy, try again in a moment";
    } else {
      friendlyError = error.message || "AI Error";
    }
    return Response.json({
      success: false,
      error: friendlyError,
    });
  }
}
