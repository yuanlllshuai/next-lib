'use client'

import { Modal } from 'antd';
import { useRouter } from 'next/navigation'

const Index = ({ title, children }: { children: React.ReactNode, title: string }) => {
    const router = useRouter();
    return (
        <Modal title={title} open={true} onOk={router.back} onCancel={router.back}>
            {children}
        </Modal>
    )
}

export default Index;