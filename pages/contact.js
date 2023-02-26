import {Input, Textarea, Button, Box, Alert, AlertTitle, AlertIcon, AlertDescription, Container} from '@chakra-ui/react'
import emailjs from '@emailjs/browser';
import React from 'react';


class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSuccess: false,
        }
    };

    render(){
        const showSuccess = this.state.showSuccess;
        const sendEmail = (e) => {
            e.preventDefault();
            emailjs.sendForm('service_sd8gc3h', 'template_od3xnbs', document.getElementById('contact-form'), 'TZ-qrvmW-85tlD7YU')
              .then((result) => {
                this.setState({showSuccess: true})
                console.log(result.text);
              }, (error) => {
                  console.log(error.text);
              });
        };
        let alert;
        if(showSuccess) {
            alert = <Alert mb={5}
            status='success'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            height='200px'
            borderRadius='5px'
            >
                <AlertIcon boxSize='40px' mr={0} />
                <AlertTitle mt={4} mb={1} fontSize='lg'>
                    Email submitted!
                </AlertTitle>
                <AlertDescription maxWidth='sm'>
                    Thanks for reaching out! Will be in touch soon!
                </AlertDescription>
            </Alert>
        }
        return(
            <Container>
                {alert}
                <Box marginBottom='10px' borderRadius="lg" bg="teal" p={3} mb={6} align="center">
                    Contact Me
                </Box>
                <form id='contact-form' onSubmit={sendEmail}>
                    <label>Name</label>
                    <Input required type="text" name="from_name" placeholder="John Doe"/>
                    <label>Email</label>
                    <Input required type="email" name="user_email" placeholder="johndoe@email.com" />
                    <label>Message</label>
                    <Textarea height="100px" required type="text" name="message" placeholder="Message" />
                    <br />
                    <Button marginTop={'10px'} type="submit" colorScheme='teal'> Submit Email</Button>
                </form>
            </Container>
        )
    }
}

export default Contact