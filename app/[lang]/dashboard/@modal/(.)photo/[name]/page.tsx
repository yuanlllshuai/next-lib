import Modal from '@/app/ui/modal';
import Image from 'next/image';

const Index = ({ params }: { params: { name: string } }) => {
    return (
        <Modal title={params.name}>
            <div>
                <Image
                    src={`/customers/${params.name}`}
                    className="rounded-full"
                    width={50}
                    height={50}
                    alt={`${params.name}'s profile picture`}
                />
            </div>
        </Modal>
    )
}

export default Index;