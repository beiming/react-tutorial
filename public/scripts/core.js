var CommentBox = React.createClass({
	getInitialState: function(){
		return {data: []};
	},
	loadCommentsFromServer: function(){
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data){
				this.setState({data: data})
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString())
			}.bind(this)
		});
	},
	componentDidMount: function(){
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	handleCommentSubmit: function(comment){
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleCommentDelete: function(commentId){
		var comments = this.state.data;
		// var newComments = comments.slice();
		// var index = newComments.findIndex(function(comment, index, array){return comment.id == commentId})
		// if(index != -1)
		// 	newComments.splice(index, 1)
		var newComments = _.filter(newComments, function(comment) {
			return comment.id == commentId
		});
		this.setState({data: newComments});
		$.ajax({
			url: this.props.url + '/' + commentId,
			dataType: 'json',
			type: 'DELETE',
			data: commentId,
			success: function(data){
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err){
				this.setState({data: comments});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div className = "commentBox"> 
			<h1>Comments</h1>
			<CommentList data={this.state.data} onCommentDelete={this.handleCommentDelete} />
			<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
			);
	}
});

var Comment = React.createClass({
	editHandler: function(){

	},
	deleteHandler: function(){
		this.props.onCommentDelete(this.props.id)
	},
	render: function() {
		return (
			<div className="comment">
				<div className="option">
					<button type="button" name="edit" onClick={this.editHandler}>Edit</button>
					<button type="button" name="delete" onClick={this.deleteHandler}>Delete</button>
				</div>
				<div className="content">
					<h3 className="commentAuthor">{this.props.author}</h3>
					<span dangerouslySetInnerHTML={this.rawMarkup()} />
				</div>
			</div>
		);
	},
	rawMarkup: function() {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    	return { __html: rawMarkup };
	}
});

var CommentList = React.createClass({
	render: function(){
		var commentNodes = this.props.data.map(function(comment){
			return(
				<Comment author={comment.author} 
						 id={comment.id} 
						 key={comment.id}
						 onCommentDelete={this.props.onCommentDelete}>
					{comment.text}
				</Comment>
				);
		}.bind(this));
		return(
			<div className="commentList">
				{commentNodes}
			</div>			
			);
	}
});

var CommentForm = React.createClass({
	getInitialState: function() {
		return {author: '', text: ''};
	},
	handleAuthorChange: function(e) {
		this.setState({author: e.target.value});
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handlSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		if(!text || !author){
			return;
		}

		this.props.onCommentSubmit({author: author, text: text});
		this.setState({author: '', text: ''});
	},
	render: function() {
		return(
			<form className="commentForm" onSubmit={this.handlSubmit}>
				<input 
				 type="text" 
				 placeholder="Your name" 
				 value={this.state.author}
				 onChange={this.handleAuthorChange} 
				/>
				<input 
				 type="text" 
				 placeholder="Sat something..." 
				 value={this.state.text}
				 onChange={this.handleTextChange}
				/>
				<input type="submit" value="Post" />
			</form>
			);
	}
})

ReactDOM.render( <CommentBox url="/api/comments" pollInterval={2000} /> , document.getElementById('content'));

