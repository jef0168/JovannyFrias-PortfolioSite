import Head from 'next/head'
import Navbar from '../navbar'
import dynamic from 'next/dynamic'
import Car from '../car-model'
import CarLoader from '../car-loader'
import {Box, Container} from '@chakra-ui/react'

const LazyCar = dynamic(() => import('../car-model'), {
    ssr: false,
    loading: () => <CarLoader/>
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
                <Car/>
                {children}
            </Container>
        </Box>
    )
}

export default Main