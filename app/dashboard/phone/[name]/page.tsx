import Image from 'next/image';

const Index = ({ params }: { params: { name: string } }) => {
    return (
        <div>
            <Image
                src={`/customers/${params.name}`}
                className="rounded-full"
                width={100}
                height={100}
                alt={`${params.name}'s profile picture`}
            />
        </div>
    )
}

export default Index;