from transformers import (
    LlamaForCausalLM, 
    LlamaTokenizer,
    Pipeline,
    PreTrainedTokenizer
)
import torch
from typing import List, Dict, Union, Optional
import warnings

class TextGenerationPipeline(Pipeline):
    """
    Text generation pipeline using AutoModelForCausalLM. This pipeline predicts the next tokens 
    given a text prompt.
    """

    def __init__(
        self,
        model: LlamaForCausalLM,
        tokenizer: PreTrainedTokenizer,
        device: int = -1,
        framework: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            model=model,
            tokenizer=tokenizer,
            device=device,
            framework=framework,
            **kwargs
        )

        if self.framework != "pt":
            raise ValueError(f"Framework {self.framework} is not supported. Only PyTorch is supported.")

    def _sanitize_parameters(
        self,
        max_length: Optional[int] = None,
        max_new_tokens: Optional[int] = None,
        min_length: Optional[int] = None,
        min_new_tokens: Optional[int] = None,
        do_sample: Optional[bool] = None,
        temperature: Optional[float] = None,
        top_k: Optional[int] = None,
        top_p: Optional[float] = None,
        repetition_penalty: Optional[float] = None,
        **generate_kwargs
    ):
        preprocess_params = {}
        forward_params = generate_kwargs
        postprocess_params = {}

        if max_length is not None:
            forward_params["max_length"] = max_length
        if max_new_tokens is not None:
            forward_params["max_new_tokens"] = max_new_tokens
        if min_length is not None:
            forward_params["min_length"] = min_length
        if min_new_tokens is not None:
            forward_params["min_new_tokens"] = min_new_tokens
        if do_sample is not None:
            forward_params["do_sample"] = do_sample
        if temperature is not None:
            forward_params["temperature"] = temperature
        if top_k is not None:
            forward_params["top_k"] = top_k
        if top_p is not None:
            forward_params["top_p"] = top_p
        if repetition_penalty is not None:
            forward_params["repetition_penalty"] = repetition_penalty

        return preprocess_params, forward_params, postprocess_params

    def preprocess(self, text_inputs, **preprocess_parameters):
        if isinstance(text_inputs, str):
            text_inputs = [text_inputs]
        
        # Tokenize inputs
        encodings = self.tokenizer(
            text_inputs,
            padding=True,
            truncation=True,
            return_tensors="pt"
        )
        
        # Move to correct device
        encodings = self.ensure_tensor_on_device(**encodings)
        return encodings

    def _forward(self, model_inputs, **forward_params):
        input_ids = model_inputs["input_ids"]
        attention_mask = model_inputs.get("attention_mask", None)

        # Generate text using model
        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                **forward_params
            )

        return {"generated_token_ids": outputs}

    def postprocess(self, model_outputs, **postprocess_parameters):
        generated_token_ids = model_outputs["generated_token_ids"]
        
        # Decode generated tokens to text
        generated_texts = self.tokenizer.batch_decode(
            generated_token_ids, 
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )
        
        records = []
        for text in generated_texts:
            records.append({"generated_text": text})
            
        return records

    def __call__(self, text_inputs: Union[str, List[str]], **kwargs):
        """
        Generate text given a prompt or batch of prompts.

        Args:
            text_inputs (str or List[str]): The prompt text(s) to generate from
            **kwargs: Additional generation parameters like max_length, temperature etc.

        Returns:
            list: List of dicts containing generated text for each input
        """
        return super().__call__(text_inputs, **kwargs) 