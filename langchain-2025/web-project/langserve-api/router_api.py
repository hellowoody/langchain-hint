from fastapi import APIRouter
from starlette.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import AIMessageChunk,HumanMessage
from chain_wrapper import chat as chat_chain

class Item(BaseModel):
    content: str

router = APIRouter()

async def generate_response(content):
    # chat_chain.config["configurable"]["session_id"] = time.time()
    print(chat_chain.config)

    input_messages = [HumanMessage(content)]
    async for message_chunk,metadata in chat_chain.app.astream(
        {"messages":input_messages},
        config=chat_chain.config,
        stream_mode="messages",
    ):
        # 确保将AIMessageChunk对象转换为字符串
        if isinstance(metadata, AIMessageChunk):
            # print(1000,message_chunk)
            message_str = str(message_chunk.content)
        else:
            # print("2000====>>",metadata)
            message_str = message_chunk.content
        
        # 将字符串编码为字节流
        yield message_str.encode('utf-8')


@router.post("/api/chat")
async def chat(item:Item):
    print("传输的参数为：",item.content)
    return StreamingResponse(generate_response(item.content),media_type="text/event-stream")