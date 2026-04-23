'use client';

import { Button } from 'antd';
import model from '@/app/lib/model/groq';

const Index = () => {
  const init = async () => {
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
  return <Button onClick={init}>Stream Test</Button>;
};

export default Index;
