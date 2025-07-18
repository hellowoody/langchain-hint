from dotenv import load_dotenv,find_dotenv
from langchain_community.chat_models.tongyi import ChatTongyi
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import time

_ = load_dotenv(find_dotenv())

model = ChatTongyi(
    streaming=True,
    name="qwen-turbo"
)

# Define a new graph
workflow = StateGraph(state_schema=MessagesState)

prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system","你是一位乐于助人的助手。尽你所能回答所有问题。"),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

def call_model(state: MessagesState):
    prompt = prompt_template.invoke(state)
    response = model.invoke(prompt)
    return {"messages": response}

workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

config = {
    "configurable":{
        "session_id":time.time(),
        "thread_id":time.time()
    }
}

