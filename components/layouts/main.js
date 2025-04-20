import Head from 'next/head'
import Navbar from '../navbar'
import dynamic from 'next/dynamic'
import {Box, Container} from '@chakra-ui/react'
import ComputerLoader from '../computer-loader'

const LazyComputer = dynamic(() => import('../computer'), {
    ssr: false,
    loading: () => <ComputerLoader/>
})

const Main = ({children, router}) => {
    
    return(
        <Box as="main" pb={8}>
            <Head>
                <meta name="viewport"  content ="width=device-width, initial-scale=1"/>
                <title>Jovanny Frias - Homepage</title>
            </Head>
            <Navbar path={router.asPath}/>
            <Container maxW="container.md" pt={14}>
                <LazyComputer/>
                {children}
            </Container>
        </Box>
    )
}

export default Main