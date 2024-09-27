import "@std/dotenv/load"
import {log} from "./kits.ts"
// console.log(Deno.env.get("ZHIPUAI_API_KEY"))

// Using Language Models

import { ChatZhipuAI } from "@langchain/community/chat_models/zhipuai"
import { HumanMessage, SystemMessage} from "@langchain/core/messages"

const model = new ChatZhipuAI({
    model:"glm-4",
    temperature:0.5
})

const messages = [
    new SystemMessage("Translate the following from English into Chinese"),
    new HumanMessage("hello")
]

const res_structure = await model.invoke(messages)

log("res_structure")
console.log(res_structure)

// OutputParsers

import { StringOutputParser } from "@langchain/core/output_parsers"

const parser = new StringOutputParser()

const res_str = await parser.invoke(res_structure)

log("res_str")
console.log(res_str)

// Chaining together components with LCE

const chain = model.pipe(parser)

const res_str_chain = await chain.invoke(messages)

log("res_str_chain")
console.log(res_str_chain)

// Prompt Templates

import { ChatPromptTemplate } from "@langchain/core/prompts"

const systemTemplate = "Translate the following into {lang}: "
const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system",systemTemplate],
    ["user","{text}"]
])

const promptValue = await promptTemplate.invoke({
    lang:"Japanese",
    text:"再会"
})

log("promptValue")
console.log(promptValue)

const msgs = promptValue.toChatMessages()

log("msgs")
console.log(msgs)

const llmChain = promptTemplate.pipe(model).pipe(parser)
const res = await llmChain.invoke({
    lang:"Japanese",
    text:"再见"
})

log("res")
console.log(res)