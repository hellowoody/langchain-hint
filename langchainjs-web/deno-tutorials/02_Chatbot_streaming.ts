import "@std/dotenv/load"
import { RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import type { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatZhipuAI } from "@langchain/community/chat_models/zhipuai";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history"
import { HumanMessage,AIMessage} from "@langchain/core/messages"

type ChainInput = {
    chat_history:BaseMessage[];
    input:string;
} 

const filterMessages = (input:ChainInput) => input.chat_history.slice(-10)

const model = new ChatZhipuAI({
    model:"glm-4",
    temperature:0.6
})

const prompt = ChatPromptTemplate.fromMessages([
    ["system","You are a helpful assistant who remembers all details the user shares with you."],
    ["placeholder","{chat_history}"],
    ["human","{input}"]
])

const chain = RunnableSequence.from<ChainInput>([
    RunnablePassthrough.assign({
        chat_history:filterMessages
    }),
    prompt,
    model,
])

const messageHistories: Record<string,InMemoryChatMessageHistory> = {}

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
       sessionId:"id02" 
    }
}

const stream = await withMessageHistory.stream(
    {
        input:"嗨，我是王五，请给我讲个笑话",
        chat_history:[]
    },
    config
)

for await (const chunk of stream) {
    console.log("|",chunk.content)
}