import * as React from 'react'
// //@ts-ignore
// import Dimensions from 'react-dimensions'
import { getContent } from '../utils'
import SideBarText from '../components/index'

const SUPERNATURAL = 'Supernatural_(U.S._TV_series)'
class AnnotatedText extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            htmlContent: []
        }
    }

    public async componentDidMount() {
        try {
            const htmlContent = await getContent(SUPERNATURAL)
            this.setState({ htmlContent })
        } catch (e) {
            console.log(e)
        }
    }


    public render() {
        const { htmlContent } = this.state
        if (htmlContent.length > 0) {
            return (
                <SideBarText
                    data={htmlContent[0]}
                    width={600}
                />

            )
        }

        return (
            <> AnnotatedText</>
        )
    }

}
export default AnnotatedText