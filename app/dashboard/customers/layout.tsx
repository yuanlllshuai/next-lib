export default function Layout({
    children,
    admin,
}: {
    admin: React.ReactNode,
    children: React.ReactNode,
}) {
    return (
        <>
            {children}
            {admin}
        </>
    )
}