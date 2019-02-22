import * as React from 'react'
import { withStyles, createStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import Connections from './Connections'
import { parseContent } from '../utils'
// //@ts-ignore
import Dimensions from 'react-dimensions'
import { compose } from 'recompose'

interface ComponentProps {
    width: number,
    data: any,
    classes: any
}
const DEFAULT_CLASSNAME = 'annotated-no-color'
const HIGHLIGHT_COLOR = 'rgba(255,255,0,0.5)'


const styles = (theme: Theme) => createStyles({
    body: {
        '@global': {
            backgroundColor: theme.palette.background.paper,
        },
    },
    title: {
        height: '100px'
    },
    content: {
        marginTop: '20px',
        textAlign: 'left',
    }

})

class SideBarText extends React.Component<ComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            sentences: [],
            links: [],
            images: {},
            sentenceIds: {},
            connections: {},
            svgY: 0,
            svgX: 0,
            svgHeight: 0,
            targetHeight: 0,
            targetBottom: 0 
        }
    }

    public componentDidMount() {
        if (this.props.data) {
            let content = this.props.data.content
            content = content.replace(/<[^>]*>/gi, "")
            const sentences = content.match(/\b((?!=|\.\s).)+(.)\b/gi)
            const links = this.props.data.links
            const sentenceIds = parseContent(sentences, links)
            window.addEventListener('resize', this.mapConnections) // add window listener to get changes of resizing 
            this.setState({ sentenceIds })
        }
    }

    public componentDidUpdate = (prevProps: any, prevState: any) =>{
        // resize on winow change
        if(this.state.sentenceIds !== prevState.sentenceIds 
            || prevProps.containerWidth !== this.props.containerWidth 
            || prevProps.containerHeight !== this.props.containerHeight) {
            this.mapConnections()
        }

    }
    public componentWillUnmount = () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', this.mapConnections)
		}
	}

    public mapContent() {
        const content = { ...this.state.sentenceIds }
        return Object.keys(content).map((key: string, index: number) => {
            const wordsArray = content[key]
            return wordsArray.map((w: any, i: number) => {
                let backgroundColor = w.classname === HIGHLIGHT_COLOR ? HIGHLIGHT_COLOR : 'none'
                const lookup = w.classname === HIGHLIGHT_COLOR ? 'lookup' : 'nolookup'
                return (
                    <div
                        id={`sid${w.id}-${lookup}`}
                        style={{ display: 'inline', backgroundColor, fontSize: 14, overflow: 'auto' }}
                        className={w.text}
                        key={`annotated-${i}`}
                        onClick={() => console.log(w.text)}
                    >
                        {w.text}
                    </div>
                )
            })
        })
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    // Get All Coordinates to map our connections
    public mapConnections = () => {
        const contentDivElement = document.getElementById('div-content')
        const targetElement = document.getElementById('target-text')
        if(contentDivElement) { // get content with 
            const outerDivPositionInfo = contentDivElement.getBoundingClientRect()
            const svgX =  outerDivPositionInfo.right // get the right most to use as our x value
            const svgY = outerDivPositionInfo.top
            const svgHeight = outerDivPositionInfo.height
            this.setState({svgY, svgHeight, svgX })
        }
        if(targetElement){
            let targetDimensions = targetElement.getBoundingClientRect()
            const targetHeight = targetDimensions.top
            const targetBottom = targetDimensions.bottom
            this.setState({ targetHeight, targetBottom})
        }
        const content = { ...this.state.sentenceIds }       
        const connections =  Object.keys(content).reduce((acc: any, key: string, index: number) => {
            const wordsArray = content[key]
            wordsArray.forEach((w:any, i:number) => {
                const lookup = w.classname === HIGHLIGHT_COLOR ? 'lookup' : null
                const el = document.getElementById(`sid${w.id}-${lookup}`)
                if (el) {
                    const positionInfo = el.getBoundingClientRect()
                    const top = positionInfo.top
                    const bottom = el.offsetHeight + top
                    acc[w.id] = { top, bottom, text: w.text}
                }
            })
            return acc
        }, {})
        this.setState({connections})
    }


    public render() {
        const height = window.innerHeight || 800
        const { data, width, classes } = this.props
        const { connections, svgY, svgX, svgHeight, targetHeight, targetBottom } = this.state
        const title = data.title
        const content = this.mapContent()
        let sourceConnections = (<></>)
        const connectionKeys = Object.keys(connections)
        if(connectionKeys.length > 0) {
            sourceConnections = (
                <Connections
                    height= {svgHeight}
                    startingHeight={svgY}
                    startingWidth={svgX}
                    width={300}
                    sourceConn={connections}
                    targetHeight={targetHeight}
                    targetBottom ={targetBottom}
                />
            )
        }
        // total width of text is static, width = 600
        return (
            <>
                <div style={{ width, height, padding: '30px' }} id={'outer-div'} >
                    <div className={classes.title}>
                        <Typography variant={'h3'} style={{ color: 'rgba(47,79,79, 0.9)' }}> {title} </Typography>
                    </div>
                    <div className={classes.content} >
                        <Typography variant={'body1'} style={{ float: 'left' }} id={'div-content'}> {content} </Typography>
                    </div>
                </div>
                {sourceConnections}
                <div style={{ display: 'inline' }}>
                    <Typography variant={'h4'} id={'target-text'} style={{ display: 'inline', marginLeft: 300 }}> SuperNatural Entities </Typography>
                </div>
            </>
        )
    }
}

export default  compose(withStyles(styles), Dimensions({ elementResize: true }))(SideBarText)  as any