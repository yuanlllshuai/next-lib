'use client';

import { Button } from 'antd';
import model from '@/app/lib/model/groq';
import * as z from 'zod';
import { createAgent, tool } from 'langchain';
import { InMemoryStore } from '@langchain/langgraph';

const Index = () => {
  const init = async () => {
    const store = new InMemoryStore();

    // Access memory
    const getUserInfo = tool(
      async ({ user_id }) => {
        const value = await store.get(['users'], user_id);
        console.log('get_user_info', user_id, value);
        return value;
      },
      {
        name: 'get_user_info',
        description: 'Look up user info.',
        schema: z.object({
          user_id: z.string(),
        }),
      },
    );

    // Update memory
    const saveUserInfo = tool(
      async ({ user_id, name, age, email }) => {
        console.log('save_user_info', user_id, name, age, email);
        await store.put(['users'], user_id, { name, age, email });
        return 'Successfully saved user info.';
      },
      {
        name: 'save_user_info',
        description: 'Save user info.',
        schema: z.object({
          user_id: z.string(),
          name: z.string(),
          age: z.number(),
          email: z.string(),
        }),
      },
    );

    const agent = createAgent({
      model,
      tools: [getUserInfo, saveUserInfo],
      store,
    });

    // First session: save user info
    await agent.invoke({
      messages: [
        {
          role: 'user',
          content:
            'Save the following user: userid: abc123, name: Foo, age: 25, email: foo@langchain.dev',
        },
      ],
    });

    // Second session: get user info
    const result = await agent.invoke({
      messages: [
        { role: 'user', content: "Get user info for user with id 'abc123'" },
      ],
    });

    console.log(result);
    // Here is the user info for user with ID "abc123":
    // - Name: Foo
    // - Age: 25
    // - Email: foo@langchain.dev
  };
  return <Button onClick={init}>Tools Test</Button>;
};

export default Index;
