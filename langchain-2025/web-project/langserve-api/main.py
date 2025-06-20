#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langserve import add_routes
from dotenv import load_dotenv,find_dotenv
from langchain_community.chat_models.tongyi import ChatTongyi


# 1. Create prompt template
system_template = "Translate the following into {language}:"
prompt_template = ChatPromptTemplate.from_messages([
    ("system",system_template),
    ("user","{text}")
])

# 2 获取你的 API Key
_ = load_dotenv(find_dotenv())

# 3. Create model
model = ChatTongyi(
    streaming=True,
)

# 5. Create chain
chain = prompt_template | model 

# 6. App definition
app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

# 7. Adding chain route
add_routes(
    app,
    chain,
    path="/api",
)



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)   