import { Container, Box, Heading , Image, chakra} from '@chakra-ui/react'
import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { BioYear, BioSection } from '../components/bio'

const ProfileImage = chakra(Image, {
    shouldForwardProp: prop => ['width', 'height', 'src', 'alt'].includes(prop)
  })

const Home = () => {
  return (
    <Container>
      <Box borderRadius="lg" bg="teal" p={3} mb={6} align="center">
        Hello, I&apos;m a full-stack developer based in Texas!
      </Box>
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Jovanny Frias
          </Heading>
          <p>Full-Stack Developer</p>
        </Box>
        <Box
          flexShrink={0}
          mt={{ base: 4, md: 0 }}
          ml={{ md: 6 }}
          textAlign="center"
        >
            <Box
            borderColor="whiteAlpha.800"
            borderWidth={2}
            borderStyle="solid"
            w="100px"
            h="100px"
            display="inline-block"
            borderRadius="full"
            overflow="hidden"
          >
            <ProfileImage
              src="/images/jovanny.png"
              alt="Profile image"
              borderRadius="full"
              width="100%"
              height="100%"
            />
          </Box>
        </Box>
      </Box>
      <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          Work
        </Heading>
        <Paragraph>
          Hello
        </Paragraph>
        <Heading as="h3" variant="section-title">
          Life and Journey
        </Heading>
        <BioSection>
          <BioYear>
            1999
          </BioYear>
          Born in Zacatecas ,Mexico (🇲🇽)
        </BioSection>
        <BioSection>
          <BioYear>
            2020
          </BioYear>
          Completed Bachelors of Science in Computer Science at the University of North Texas
          located 45 minutes north of Dallas, Texas.
        </BioSection>
        <BioSection>
          <BioYear>
            2021 - Present
          </BioYear>
          Started TaxAct as a Software Engineer 1
        </BioSection>
        <BioSection>
          <BioYear>
            2023
          </BioYear>
          Plan on pursuing a Masters degree to futher my eduction from Georgia Tech
        </BioSection>
      </Section>
    </Container>
  )
}

export default Home
export {getServerSideProps} from '../components/chakra'