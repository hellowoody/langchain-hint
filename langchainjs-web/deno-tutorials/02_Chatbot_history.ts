import "@std/dotenv/load"
import { ChatZhipuAI} from "@langchain/community/chat_models/zhipuai"
import { log } from "./kits.ts"

const model = new ChatZhipuAI({
    model:"glm-4",
    temperature:0.6
})

import { ChatPromptTemplate} from "@langchain/core/prompts"

const prompt = ChatPromptTemplate.fromMessages([
    ["system","You are a helpful assistant who remembers all details the user shares with you."],
    ["placeholder","{chat_history}"],
    ["human","{input}"]
])

import type {BaseMessage} from "@langchain/core/messages"
import {
    RunnablePassthrough,
    RunnableSequence,
    RunnableWithMessageHistory
} from "@langchain/core/runnables"

type ChainInput = {
    chat_history:BaseMessage[];
    input:string;
}

const filterMessages = (input:ChainInput) => input.chat_history.slice(-10)

const chain = RunnableSequence.from<ChainInput>([
    RunnablePassthrough.assign({
        chat_history:filterMessages,
    }),
    prompt,
    model
])

import { HumanMessage,AIMessage } from "@langchain/core/messages"

const messages = [
    new HumanMessage({ content: "嗨! 我是张三" }),
    new AIMessage({ content: "你好!" }),
    new HumanMessage({ content: "我喜欢香草冰淇凌" }),
    new AIMessage({ content: "不错" }),
    new HumanMessage({ content: "2+2等于多少？" }),
    new AIMessage({ content: "4" }),
    new HumanMessage({ content: "谢谢" }),
    new AIMessage({ content: "不客气!" }),
    new HumanMessage({ content: "玩得开心吗?" }),
    new AIMessage({ content: "是的!" }),
    new HumanMessage({ content: "那太棒了!" }),
    new AIMessage({ content: "对 是的!" }),
];

const resp = await chain.invoke({
    chat_history:messages,
    input:"我叫什么？"
})

log("resp.content")
console.log(resp.content)

const resp2 = await chain.invoke({
    chat_history: messages,
    input: "我喜欢的冰淇凌口味",
});
resp2.content;

log("resp2.content")
console.log(resp2.content)


import { InMemoryChatMessageHistory } from "@langchain/core/chat_history"

const messageHistories: Record<string,InMemoryChatMessageHistory> = {}

const withMessageHistory = new RunnableWithMessageHistory({
    runnable:chain,
    getMessageHistory:async sessionId => {
        if(messageHistories[sessionId] === undefined){
           const messageHistory = new InMemoryChatMessageHistory()
           await messageHistory.addMessages(messages)
           messageHistories[sessionId] = messageHistory
        }
        return messageHistories[sessionId]
    },
    inputMessagesKey:"input",
    historyMessagesKey:"chat_history"
})

const config = {
    configurable:{
        sessionId:"id01"
    }
}

const resp3 = await withMessageHistory.invoke(
    {
        input:"我的名字是什么？",
        chat_history:[]
    },
    config
)

log("resp3")
console.log(resp3.content)

const resp4 = await withMessageHistory.invoke(
    {
        input:"我最爱吃的冰淇凌口味",
        chat_history:[]
    },
    config
)

log("resp4")
console.log(resp4.content)




