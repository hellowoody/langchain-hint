import "@std/dotenv/load"
import { ChatZhipuAI} from "@langchain/community/chat_models/zhipuai"
import { log } from "./kits.ts"

const model = new ChatZhipuAI({
    model:"glm-4",
    temperature:0.6
})

import { HumanMessage } from "@langchain/core/messages"

const res_structure = await model.invoke([
    new HumanMessage({content:"你好，我是Bob"})
])

log("res_structure")
console.log(res_structure)


const res_structure2 = await model.invoke([
    new HumanMessage({content:"我的名字叫什么?"})
])

log("res_structure2")
console.log(res_structure2)

import {AIMessage} from "@langchain/core/messages"

const res_structure3 = await model.invoke([
    new HumanMessage({content:"嗨，我是张三"}),
    new AIMessage({content:"你好 张三！今天我如何帮助你？"}),
    new HumanMessage({content:"我叫什么？"})
])

log("res_structure3")
console.log(res_structure3)

// Message History
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history"
import { ChatPromptTemplate} from "@langchain/core/prompts"
import { RunnableWithMessageHistory } from "@langchain/core/runnables"

const messageHistories: Record<string,InMemoryChatMessageHistory> = {}

const prompt = ChatPromptTemplate.fromMessages([
    ["system","你是一个乐于助人的助手，能够记住用户与你分享的所有细节。"],
    ["placeholder","{chat_history}"],
    ["human","{input}"]
])

const chain = prompt.pipe(model)

const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
      if (messageHistories[sessionId] === undefined) {
        messageHistories[sessionId] = new InMemoryChatMessageHistory();
      }
      return messageHistories[sessionId];
    },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});

const config = {
    configurable: {
        sessionId: "abc1",
    },
};

const response = await withMessageHistory.invoke(
    {
        input: "嗨，我是张三",
    },
    config
);

log("response.content")
console.log(response.content)

const followupResponse = await withMessageHistory.invoke(
    {
        input: "我叫什么？",
    },
    config
);

log("followupResponse.content")
console.log(followupResponse.content)
