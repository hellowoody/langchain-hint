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
