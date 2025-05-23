import Logo from './logo'
import NextLink from 'next/link'
import {
  Container,
  Box,
  Link,
  Stack,
  Heading,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import ThemeToggleButton from './theme-toggle-button'

const LinkItem = ({ href, path, children }) => {
    const active = path === href
    const inactiveColor = useColorModeValue('gray200', 'whiteAlpha.900')
    return (
        <NextLink href={href} legacyBehavior>
            <Link p={2}
                bg={active ? 'glassTeal' : undefined}
                color={active ? '#202023' : inactiveColor}
            >
                {children}
            </Link>
        </NextLink>
    );
}

const DownloadItem = ({href, path, children}) => {
    const active = path ===href 
    const inactiveColor = useColorModeValue('gray200', 'whiteAlpha,900')
    console.log('Clicked')
    return (
        <NextLink href={href} legacyBehavior>
            <Link href={href} p={2} target="_blank" download
                bg={active ? 'glassTeal' : undefined}
                color={active ? '#202023' : inactiveColor}
            >
                {children}
            </Link>
        </NextLink>
    );
}

const Navbar = props => {
    const { path } = props
    return (
        <Box position='fixed' as='nav' w='100%' bg={useColorModeValue('#ffffff40', '#20202380')} style={{ backdropFilter: 'blur(10px)' }} zIndex={1} {...props}>
            <Container display="flex" p={2} maxW='container.md' wrap='wrap' align='center' justify='space-between'>
                <Flex align='center' mr={5}>
                    <Heading as='h1' size='lg' letterSpacing={'tighter'}>
                        <Logo />
                    </Heading>
                </Flex>
                <Stack direction={{ base: 'column', md: 'row' }} display={{ base: 'none', md: 'flex' }} width={{ base: 'full', md: 'auto' }} alignItems='center' mt={{ base: 4, nmd: 0 }} flexGrow={1}>
                    <LinkItem href="/projects" path={path}>
                        Projects
                    </LinkItem>
                    <LinkItem href="/posts" path={path}>
                        Posts
                    </LinkItem>
                    <LinkItem href="/contact" path={path}>
                        Contact
                    </LinkItem>
                    <DownloadItem href="./public/Resume.pdf">
                        Resume
                    </DownloadItem>
                </Stack>
                <Box flex={1} align='right'>
                    <ThemeToggleButton/>
                    <Box ml={2} display={{ base: 'inline-block', md: 'none' }}>
                        <Menu isLazy id="navbar-menu">
                            <MenuButton
                                as={IconButton}
                                icon={<HamburgerIcon />}
                                variant="outline"
                                aria-label="Options"
                            />
                            <MenuList>
                                <NextLink href="/" passHref legacyBehavior>
                                    <MenuItem as={Link}>About</MenuItem>
                                </NextLink>
                                <NextLink href="/projects" passHref legacyBehavior>
                                    <MenuItem as={Link}>Projects</MenuItem>
                                </NextLink>
                                <NextLink href="/posts" passHref legacyBehavior>
                                    <MenuItem as={Link}>Posts</MenuItem>
                                </NextLink>
                                <NextLink href='../public/Resume.docx' legacyBehavior>
                                    <MenuItem as={Link}>Resume</MenuItem>
                                </NextLink>
                                <NextLink href='../contact' passHref legacyBehavior>
                                    <MenuItem as={Link}>Contact</MenuItem>
                                </NextLink>
                            </MenuList>
                        </Menu>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Navbar;