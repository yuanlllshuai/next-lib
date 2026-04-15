'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import model from '@/app/lib/model/groq';
import { createAgent, tool, type ToolRuntime } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import * as z from 'zod';
export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  const test = async () => {
    const conversation = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that translates English to Simplified Chinese.',
      },
      { role: 'user', content: 'Translate: I love programming.' },
      // { role: 'assistant', content: "J'adore la programmation." },
      // { role: 'user', content: 'Translate: I love building applications.' },
    ];

    const response = await model.invoke(conversation);
    console.log(response);
  };

  const getData = async () => {
    const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;

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
      <form action={dispatch} className="space-y-3">
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Please log in to continue.
          </h1>
          <div className="w-full">
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          <LoginButton />
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
      <Button onClick={getData}>Get</Button>
      <Button onClick={test}>Test</Button>
    </>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
