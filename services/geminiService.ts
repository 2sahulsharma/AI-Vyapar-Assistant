
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "DUMMY_API_KEY" });

export interface ParsedInvoice {
    customerName: string;
    items: {
        productName: string;
        quantity: number;
    }[];
}

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const parseInvoiceCommand = async (command: string, products: Product[]): Promise<ParsedInvoice | null> => {
    if (!process.env.API_KEY) return null;
    
    const productList = products.map(p => `'${p.name}' (Price: ${p.price}, Stock: ${p.stock})`).join(', ');

    const prompt = `
        Parse the following user command to create an invoice.
        User command: "${command}"
        
        Available products are: ${productList}.
        
        Identify the customer's name and the products with their quantities.
        The product name in your response must exactly match one of the available product names.
        If a product in the command does not match any available products, ignore it.
        Respond in the requested JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        customerName: {
                            type: Type.STRING,
                            description: "The name of the customer.",
                        },
                        items: {
                            type: Type.ARRAY,
                            description: "List of items for the invoice.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productName: {
                                        type: Type.STRING,
                                        description: "The name of the product, must be from the available products list.",
                                    },
                                    quantity: {
                                        type: Type.INTEGER,
                                        description: "The quantity of the product.",
                                    },
                                },
                                required: ["productName", "quantity"],
                            },
                        },
                    },
                    required: ["customerName", "items"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ParsedInvoice;

    } catch (error) {
        console.error("Error parsing invoice command with Gemini:", error);
        return null;
    }
};

export const findProductByImage = async (imageFile: File, products: Product[]): Promise<Product | null> => {
    if (!process.env.API_KEY) return null;

    const imagePart = await fileToGenerativePart(imageFile);
    const productNames = products.map(p => p.name).join(", ");
    
    const prompt = `From the following list of products, which one best matches the product in this image? Respond with ONLY the exact product name from the list and nothing else.
    
    Product list: [${productNames}]`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const matchedProductName = response.text.trim();
        const foundProduct = products.find(p => p.name.toLowerCase() === matchedProductName.toLowerCase());

        return foundProduct || null;
    } catch (error) {
        console.error("Error finding product by image with Gemini:", error);
        return null;
    }
};
