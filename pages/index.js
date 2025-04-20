import { Container, Box, Heading , Image, chakra, Checkbox, Stack, Link, Tabs, TabList, Tab, TabPanels, TabPanel} from '@chakra-ui/react'
import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { BioYear, BioSection } from '../components/bio'
import { useEffect } from 'react'
const ProfileImage = chakra(Image, {
    shouldForwardProp: prop => ['width', 'height', 'src', 'alt'].includes(prop)
  })

const Home = () => {
  useEffect(() => {
  })

  return (
    <Container>
      {/* <Box borderRadius="lg" bg="teal" p={3} mb={6} align="center">
        Hello, I&apos;m a full-stack developer based in Texas!
      </Box> */}
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Jovanny Frias
          </Heading>
          <p>Software Engineer</p>
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
        <Link w={75} href='https://taxact.com' isExternal maxWidth='75px'>
          <Image borderRadius='full' boxSize='75px' opacity={1} src='/images/taxact.jpg'/>
        </Link>
        <BioSection>
          <BioYear>Software Engineer 1 @ TaxAct</BioYear>
          <Heading as='h6' size='xs'>Dallas, TX : 2021- Present</Heading>
          <Paragraph>
            I&apos;m currently working as a Software Engineer 1 at TaxAct in Dallas, Texas.
          </Paragraph>
          <Paragraph>
            My team is responsible for the development and maintenance of the Payment Processing System for TaxAct.
            I&apos;ve contributed in huge refactor efforts to improve and move our entire payment system from Chase Paymentech to Braintree by PayPal.
          </Paragraph>
        </BioSection>
        <Heading as="h3" variant="section-title">
          Life and Journey
        </Heading>
        <Section>
          <BioSection>
            <BioYear>
              1999
            </BioYear>
            Born in Zacatecas ,Mexico (🇲🇽)
          </BioSection>
          <BioSection>
            <BioYear>
              2000
            </BioYear>
            Moved to Fort Worth, TX, USA (🇺🇸)
          </BioSection>
          <BioSection>
            <BioYear>
              2017
            </BioYear>
            Graduated from Southwest High School in Fort Worth, TX, USA (🇺🇸)
            Learned a ton of life lessons from my experience in one of the top bands in the state of Texas as a
            French Horn / Mellophone player. My passion for music and performing still lives on today and the discipline learned from my
            time in band has helped me in my current career as a Software Engineer. 🎺
          </BioSection>
          <BioSection>
            <BioYear>
              2020
            </BioYear>
            Graduated with a Bachelors of Science in Computer Science from the
            University of North Texas in Denton,TX, USA (🇺🇸)
          </BioSection>
          <BioSection>
            <BioYear>
              2023
            </BioYear>
            Engaged to my beautiful fiance !
          </BioSection>
          <BioSection>
            <BioYear>
              Future
            </BioYear>
            <Stack direction='column' mt={3} spacing={5}>
              <Checkbox isDisabled verticalAlign="center" align="center" pointerEvents="none"><div></div>Complete a Masters program in Artificial Intelligence</Checkbox>
              <Checkbox isDisabled isChecked verticalAlign="center" align="center" pointerEvents="none"><div></div>Buy a House</Checkbox>
              <Checkbox isDisabled verticalAlign="center" align="center" pointerEvents="none"><div></div>Buy my dream Car</Checkbox>
              <Checkbox isDisabled verticalAlign="center" align="center" pointerEvents="none"><div></div>Start a family</Checkbox>
            </Stack>
          </BioSection>
        </Section>
        <Heading mt={3} as="h3" variant="section-title">
          Hobbies
        </Heading>
        <BioSection>
          <Tabs variant='soft-rounded' isFitted colorScheme='teal'>
            <TabList>
              <Tab>Programming</Tab>
              <Tab>Sneakers</Tab>
              <Tab>Music</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>

              </TabPanel>
              <TabPanel>
                <Heading as='h6' size='xs'>Sneaker Head</Heading>
                
              </TabPanel>
              <TabPanel>
              <Heading as='h6' size='xs'>Music</Heading>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </BioSection>
      </Section>
    </Container>
  )
}

export default Home
export {getServerSideProps} from '../components/chakra'