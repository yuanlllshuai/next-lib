import Modal from '@/app/ui/modal';

const Index = ({ params }: { params: { name: string } }) => {
    return (
        <Modal title={params.name}>
            <div>{params.name}</div>
        </Modal>
    )
}

export default Index;