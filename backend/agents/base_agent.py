import asyncio
import time
from typing import Any, Type
from pydantic import BaseModel
from backend.models import PatientInput, AgentResponse
from backend.utils.llm_client import llm_client

class BaseAgent:
    def __init__(self, name: str, response_model: Type[BaseModel], domain: str = "general", timeout: int = 15):
        self.name = name
        self.response_model = response_model
        self.domain = domain
        self.timeout = timeout
        self.client = llm_client

    def _get_system_prompt(self) -> str:
        raise NotImplementedError("Subclasses must implement _get_system_prompt")

    def _build_user_message(self, input_data: PatientInput) -> str:
        msg = f"Patient Report:\n{input_data.patient_text}\n\n"
        msg += f"History:\n{input_data.history}\n\n"
        if input_data.metadata:
            msg += f"Metadata:\n{input_data.metadata}\n\n"
        return msg

    async def _call_llm(self, input_data: PatientInput) -> Any:
        messages = [
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": self._build_user_message(input_data)}
        ]
        
        response = await self.client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=messages,
            response_format=self.response_model,
            temperature=0.2
        )
        return response.choices[0].message.parsed

    async def run(self, input_data: PatientInput) -> AgentResponse:
        start_time = time.time()
        error_msg = None
        output = None

        try:
            # Enforce timeout natively on the async LLM call
            output = await asyncio.wait_for(self._call_llm(input_data), timeout=self.timeout)
        except asyncio.TimeoutError:
            error_msg = f"Agent {self.name} timed out after {self.timeout} seconds."
            print(error_msg)
        except Exception as e:
            error_msg = f"Agent {self.name} failed: {str(e)}"
            print(error_msg)

        latency_ms = (time.time() - start_time) * 1000

        return AgentResponse(
            output=output,
            latency_ms=latency_ms,
            error=error_msg
        )
