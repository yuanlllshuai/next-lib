'use client';

import { Button } from 'antd';
import model from '@/app/lib/model/groq';
import {
  createAgent,
  tool,
  type ToolRuntime,
  SystemMessage,
  HumanMessage,
} from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import * as z from 'zod';
import { systemPrompt } from './const';
export default function LoginPage() {
  const streamTest = async () => {
    const conversation = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that translates English to Simplified Chinese.',
      },
      { role: 'user', content: 'Translate: I love programming.' },
    ];

    const stream = await model.stream(conversation);
    for await (const chunk of stream) {
      if (!!chunk.text?.trim()) {
        console.log(chunk.text);
      }
    }
  };

  const toolTest = async () => {
    const getWeather = tool((input) => `It's sunny in ${input.location}.`, {
      name: 'get_weather',
      description: 'Get the weather at a location.',
      schema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
    });

    const modelWithTools = model.bindTools([getWeather]);

    // Step 1: Model generates tool calls
    const messages: any = [
      { role: 'user', content: "What's the weather in Tokyo?" },
    ];
    const ai_msg: any = await modelWithTools.invoke(messages);
    messages.push(ai_msg);

    console.log('Generated tool calls:', ai_msg.tool_calls);

    // Step 2: Execute tools and collect results
    for (const tool_call of ai_msg.tool_calls) {
      // Execute the tool with the generated arguments
      const tool_result = await getWeather.invoke(tool_call);
      messages.push(tool_result);
    }
    console.log(1111, messages);
    // Step 3: Pass results back to model for final response
    const final_response = await modelWithTools.invoke(messages);
    console.log('final_response', final_response.text);
  };

  const messagelTest = async () => {
    const systemMsg = new SystemMessage('You are a helpful coding assistant.');

    const messages = [
      systemMsg,
      new HumanMessage('How do I create a REST API?'),
    ];
    const response = await model.invoke(messages);
    console.log(response.text);
  };

  const getData = async () => {
    // Define tools
    const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
      name: 'get_weather_for_location',
      description: 'Get the weather for a given city',
      schema: z.object({
        city: z.string(),
      }),
    });

    type AgentRuntime = ToolRuntime;

    const getUserLocation = tool(
      (_, config: AgentRuntime) => {
        const { user_id } = config.context as any;
        return user_id === '1' ? 'Florida' : 'SF';
      },
      {
        name: 'get_user_location',
        description: 'Retrieve user information based on user ID',
        schema: z.object({}),
      },
    );

    // Define response format
    const responseFormat = z.object({
      punny_response: z.string(),
      weather_conditions: z.string().optional(),
    });

    // Set up memory
    const checkpointer = new MemorySaver();

    // Create agent
    const agent = createAgent({
      model,
      systemPrompt,
      responseFormat,
      checkpointer,
      tools: [getUserLocation, getWeather],
    });

    // Run agent
    // `thread_id` is a unique identifier for a given conversation.
    const config = {
      configurable: { thread_id: '1' },
      context: { user_id: '1' },
    };

    const response = await agent.invoke(
      { messages: [{ role: 'user', content: 'what is the weather outside?' }] },
      config,
    );
    console.log(response.structuredResponse);
    // {
    //   punny_response: "Florida is still having a 'sun-derful' day! The sunshine is playing 'ray-dio' hits all day long! I'd say it's the perfect weather for some 'solar-bration'! If you were hoping for rain, I'm afraid that idea is all 'washed up' - the forecast remains 'clear-ly' brilliant!",
    //   weather_conditions: "It's always sunny in Florida!"
    // }

    // Note that we can continue the conversation using the same `thread_id`.
    const thankYouResponse = await agent.invoke(
      { messages: [{ role: 'user', content: 'thank you!' }] },
      config,
    );
    console.log(thankYouResponse.structuredResponse);
    // {
    //   punny_response: "You're 'thund-erfully' welcome! It's always a 'breeze' to help you stay 'current' with the weather. I'm just 'cloud'-ing around waiting to 'shower' you with more forecasts whenever you need them. Have a 'sun-sational' day in the Florida sunshine!",
    //   weather_conditions: undefined
    // }
  };

  return (
    <>
      <Button onClick={streamTest}>stream test</Button>
      <Button onClick={toolTest}>tool test</Button>
      <Button onClick={messagelTest}>message test</Button>
    </>
  );
}
