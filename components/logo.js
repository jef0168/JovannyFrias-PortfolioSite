import Link from 'next/link'
import Image from 'next/image'
import { Text, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
    font-weight: bold;
    font-size: 18px;
    display: inline-flex;
    align-items; center;
    height: 50px;
    line-height: 20px;
    padding: 10px;

    img {
        transition: 200ms ease;
      }

    &:hover img {
        transform: translateY(-2px);
      }
`

const Logo = () => {
    const carPrintImg = `/images/computer${useColorModeValue('-dark', '')}.png`

    return (
        <Link href="/">
            <LogoBox>
                <Image src={carPrintImg} width={40} height={50} alt='logo'/>
                <Text color={useColorModeValue('gray.800', 'whiteAlpha.900')}
                fontFamily='M PLUS Rounded 1c'
                fontWeight='bold'
                ml={2}
                verticalAlign='center'>
                    Jovanny Frias
                </Text>
            </LogoBox>

        </Link>
    );
}

export default Logo