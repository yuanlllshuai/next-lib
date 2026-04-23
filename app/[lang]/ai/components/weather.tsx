'use client';

import { Button } from 'antd';
import model from '@/app/lib/model/groq';
import * as z from 'zod';
import { createAgent, tool, type ToolRuntime } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { systemPrompt } from '../const';

const Index = () => {
  const init = async () => {
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
  return <Button onClick={init}>Weather Test</Button>;
};

export default Index;
